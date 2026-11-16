import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { mensagemDoErro } from './src/services/api';
import { buscarPagina, Doacao, formatarDataDoacao, versaoDasDoacoes } from './src/services/doacoesService';

const DoacaoItem = memo(function DoacaoItem({
    doacao,
    onPress,
}: {
    doacao: Doacao;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity style={styles.item} onPress={onPress}>
            <Text style={styles.tipoItem}>{doacao.tipoItem}</Text>
            <Text style={styles.detalhe}>Quantidade: {doacao.quantidade}</Text>
            <Text style={styles.detalhe}>Destino: {doacao.pontoDestino}</Text>
            <Text style={styles.data}>{formatarDataDoacao(doacao.criadoEm)}</Text>
        </TouchableOpacity>
    );
});

export default function TelaMinhasDoacoes({ navigation }: { navigation: any }) {
    const [busca, setBusca] = useState('');
    const [filtro, setFiltro] = useState('');
    const [doacoes, setDoacoes] = useState<Doacao[]>([]);
    const [paginaAtual, setPaginaAtual] = useState(0);
    const [totalPaginas, setTotalPaginas] = useState(0);
    const [total, setTotal] = useState(0);
    const [carregando, setCarregando] = useState(true);
    const [carregandoMais, setCarregandoMais] = useState(false);
    const [erro, setErro] = useState('');
    const [erroMais, setErroMais] = useState('');

    // Número da busca em andamento: respostas de buscas antigas são descartadas.
    const requisicaoAtual = useRef(0);
    // Trava contra pedir a mesma página duas vezes (onEndReached pode disparar em sequência).
    const carregandoMaisRef = useRef(false);
    // Versão das doações na última vez que a lista foi buscada.
    const versaoVista = useRef(-1);

    const carregarPrimeiraPagina = useCallback(async (filtroBusca: string) => {
        const id = ++requisicaoAtual.current;
        carregandoMaisRef.current = false;
        versaoVista.current = versaoDasDoacoes();
        setCarregando(true);
        setCarregandoMais(false);
        setErro('');
        setErroMais('');
        try {
            const pagina = await buscarPagina(filtroBusca, 0);
            if (id !== requisicaoAtual.current) return;
            setDoacoes(pagina.content);
            setPaginaAtual(pagina.page.number);
            setTotalPaginas(pagina.page.totalPages);
            setTotal(pagina.page.totalElements);
        } catch (e) {
            if (id !== requisicaoAtual.current) return;
            setDoacoes([]);
            setPaginaAtual(0);
            setTotalPaginas(0);
            setTotal(0);
            setErro(mensagemDoErro(e));
        } finally {
            if (id === requisicaoAtual.current) setCarregando(false);
        }
    }, []);

    async function carregarMais(ignorarErro: boolean = false) {
        if (carregando || carregandoMaisRef.current) return;
        if (erro !== '' || (erroMais !== '' && !ignorarErro)) return;
        if (doacoes.length === 0 || paginaAtual + 1 >= totalPaginas) return;

        const id = requisicaoAtual.current;
        const proxima = paginaAtual + 1;
        carregandoMaisRef.current = true;
        setErroMais('');
        setCarregandoMais(true);
        try {
            const pagina = await buscarPagina(filtro, proxima);
            if (id !== requisicaoAtual.current) return;
            setDoacoes((atual) => {
                const existentes = new Set(atual.map((d) => d.id));
                return [...atual, ...pagina.content.filter((d) => !existentes.has(d.id))];
            });
            setPaginaAtual(proxima);
            setTotalPaginas(pagina.page.totalPages);
            setTotal(pagina.page.totalElements);
        } catch (e) {
            if (id === requisicaoAtual.current) setErroMais(mensagemDoErro(e));
        } finally {
            if (id === requisicaoAtual.current) {
                carregandoMaisRef.current = false;
                setCarregandoMais(false);
            }
        }
    }

    // Espera o usuário parar de digitar antes de buscar na API.
    useEffect(() => {
        const temporizador = setTimeout(() => setFiltro(busca.trim()), 400);
        return () => clearTimeout(temporizador);
    }, [busca]);

    // Cada busca nova volta para a primeira página.
    useEffect(() => {
        carregarPrimeiraPagina(filtro);
    }, [filtro, carregarPrimeiraPagina]);

    // Ao voltar de outra tela, busca de novo só se alguma doação foi criada, editada ou excluída.
    // A API manda a mais nova primeiro, então a doação recém-registrada aparece no topo.
    useFocusEffect(
        useCallback(() => {
            if (versaoVista.current !== -1 && versaoVista.current !== versaoDasDoacoes()) {
                carregarPrimeiraPagina(filtro);
            }
        }, [filtro, carregarPrimeiraPagina])
    );

    function renderizarCorpo() {
        if (carregando) {
            return (
                <View style={styles.centro}>
                    <ActivityIndicator size="large" color="#1B3A5C" />
                    <Text style={styles.textoApoio}>Carregando doações...</Text>
                </View>
            );
        }

        if (erro !== '') {
            return (
                <View style={styles.centro}>
                    <Text style={styles.erro}>{erro}</Text>
                    <TouchableOpacity style={styles.botaoSecundario} onPress={() => carregarPrimeiraPagina(filtro)}>
                        <Text style={styles.botaoSecundarioTexto}>Tentar novamente</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <FlatList
                data={doacoes}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <DoacaoItem
                        doacao={item}
                        onPress={() => navigation.navigate('DetalheDoacao', { doacaoId: item.id })}
                    />
                )}
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
                onEndReached={() => carregarMais()}
                onEndReachedThreshold={0.5}
                ListHeaderComponent={
                    doacoes.length > 0 ? (
                        <Text style={styles.total}>
                            {total} {total === 1 ? 'doação' : 'doações'}
                            {filtro !== '' ? ` para "${filtro}"` : ''}
                        </Text>
                    ) : undefined
                }
                ListEmptyComponent={
                    <Text style={styles.textoApoio}>
                        {filtro !== ''
                            ? `Nenhuma doação encontrada para "${filtro}".`
                            : 'Você ainda não registrou nenhuma doação.'}
                    </Text>
                }
                ListFooterComponent={
                    carregandoMais ? (
                        <ActivityIndicator style={styles.rodape} color="#1B3A5C" />
                    ) : erroMais !== '' ? (
                        <View style={styles.rodape}>
                            <Text style={styles.erro}>{erroMais}</Text>
                            <TouchableOpacity style={styles.botaoSecundario} onPress={() => carregarMais(true)}>
                                <Text style={styles.botaoSecundarioTexto}>Tentar novamente</Text>
                            </TouchableOpacity>
                        </View>
                    ) : undefined
                }
            />
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
            <View style={styles.topo}>
                <TextInput
                    style={styles.input}
                    placeholder="Buscar por tipo de item"
                    value={busca}
                    onChangeText={setBusca}
                    autoCorrect={false}
                    returnKeyType="search"
                    onSubmitEditing={() => Keyboard.dismiss()}
                    disableFullscreenUI
                />
                <TouchableOpacity style={styles.botaoPrimario} onPress={() => navigation.navigate('FormDoacao')}>
                    <Text style={styles.botaoPrimarioTexto}>Registrar doação</Text>
                </TouchableOpacity>
            </View>
            {renderizarCorpo()}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    topo: { padding: 16, paddingBottom: 8 },
    input: { borderWidth: 1, borderColor: '#CCC', borderRadius: 6, padding: 10, fontSize: 14, width: '100%', marginBottom: 8, minHeight: 44 },
    botaoPrimario: { backgroundColor: '#1B3A5C', padding: 12, borderRadius: 6, alignItems: 'center', minHeight: 44, justifyContent: 'center' },
    botaoPrimarioTexto: { color: '#fff', fontWeight: 'bold' },
    botaoSecundario: { borderWidth: 1, borderColor: '#1B3A5C', padding: 12, borderRadius: 6, alignItems: 'center', minHeight: 44, justifyContent: 'center', paddingHorizontal: 20 },
    botaoSecundarioTexto: { color: '#1B3A5C', fontWeight: '600' },
    container: { padding: 16, paddingTop: 8 },
    centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
    textoApoio: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 8 },
    erro: { color: '#C62828', fontSize: 14, textAlign: 'center' },
    total: { fontSize: 13, color: '#666', marginBottom: 8 },
    rodape: { paddingVertical: 16, alignItems: 'center', gap: 8, width: '100%' },
    item: { marginBottom: 12, padding: 12, borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, minHeight: 44 },
    tipoItem: { fontSize: 16, fontWeight: 'bold', color: '#1B3A5C' },
    detalhe: { fontSize: 14, color: '#444', marginTop: 2 },
    data: { fontSize: 12, color: '#888', marginTop: 6 },
});
