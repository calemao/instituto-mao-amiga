import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { mensagemDoErro } from './src/services/api';
import { buscarPagina, Ponto, versaoDosPontos } from './src/services/pontosService';

function PontoItem({ ponto, navigation }: { ponto: Ponto; navigation: any }) {
    return (
        <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate('DetalhePonto', { pontoId: ponto.id })}
        >
            <Text style={styles.nome}>{ponto.nome}</Text>
            <Text style={styles.endereco}>{ponto.endereco}</Text>
            <Text style={styles.tipo}>{ponto.bairro} · {ponto.tipo}</Text>
        </TouchableOpacity>
    );
}

export default function TelaListaPontos({ navigation }: { navigation: any }) {
    const [busca, setBusca] = useState('');
    const [filtro, setFiltro] = useState('');
    const [pontos, setPontos] = useState<Ponto[]>([]);
    const [paginaAtual, setPaginaAtual] = useState(0);
    const [totalPaginas, setTotalPaginas] = useState(0);
    const [carregando, setCarregando] = useState(true);
    const [carregandoMais, setCarregandoMais] = useState(false);
    const [erro, setErro] = useState('');
    const [erroMais, setErroMais] = useState('');

    // Número da busca em andamento: respostas de buscas antigas são descartadas.
    const requisicaoAtual = useRef(0);
    // Trava contra pedir a mesma página duas vezes (onEndReached pode disparar em sequência).
    const carregandoMaisRef = useRef(false);
    // Versão dos pontos na última vez que a lista foi buscada.
    const versaoVista = useRef(-1);

    const carregarPrimeiraPagina = useCallback(async (filtroBusca: string) => {
        const id = ++requisicaoAtual.current;
        carregandoMaisRef.current = false;
        versaoVista.current = versaoDosPontos();
        setCarregando(true);
        setCarregandoMais(false);
        setErro('');
        setErroMais('');
        try {
            const pagina = await buscarPagina(filtroBusca, 0);
            if (id !== requisicaoAtual.current) return;
            setPontos(pagina.content);
            setPaginaAtual(pagina.page.number);
            setTotalPaginas(pagina.page.totalPages);
        } catch (e) {
            if (id !== requisicaoAtual.current) return;
            setPontos([]);
            setPaginaAtual(0);
            setTotalPaginas(0);
            setErro(mensagemDoErro(e));
        } finally {
            if (id === requisicaoAtual.current) setCarregando(false);
        }
    }, []);

    async function carregarMais(ignorarErro: boolean = false) {
        if (carregando || carregandoMaisRef.current) return;
        if (erro !== '' || (erroMais !== '' && !ignorarErro)) return;
        if (pontos.length === 0 || paginaAtual + 1 >= totalPaginas) return;

        const id = requisicaoAtual.current;
        const proxima = paginaAtual + 1;
        carregandoMaisRef.current = true;
        setErroMais('');
        setCarregandoMais(true);
        try {
            const pagina = await buscarPagina(filtro, proxima);
            if (id !== requisicaoAtual.current) return;
            setPontos((atual) => {
                const existentes = new Set(atual.map((p) => p.id));
                return [...atual, ...pagina.content.filter((p) => !existentes.has(p.id))];
            });
            setPaginaAtual(proxima);
            setTotalPaginas(pagina.page.totalPages);
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

    // Ao voltar de outra tela, busca de novo só se algum ponto foi criado, editado ou excluído.
    useFocusEffect(
        useCallback(() => {
            if (versaoVista.current !== -1 && versaoVista.current !== versaoDosPontos()) {
                carregarPrimeiraPagina(filtro);
            }
        }, [filtro, carregarPrimeiraPagina])
    );

    function renderizarCorpo() {
        if (carregando) {
            return (
                <View style={styles.centro}>
                    <ActivityIndicator size="large" color="#1B3A5C" />
                    <Text style={styles.textoApoio}>Carregando pontos...</Text>
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
                data={pontos}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <PontoItem ponto={item} navigation={navigation} />}
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
                onEndReached={() => carregarMais()}
                onEndReachedThreshold={0.5}
                ListEmptyComponent={
                    <Text style={styles.textoApoio}>
                        {filtro !== '' ? 'Nenhum ponto encontrado para essa busca.' : 'Nenhum ponto cadastrado ainda.'}
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
                    placeholder="Buscar por nome ou bairro"
                    value={busca}
                    onChangeText={setBusca}
                    autoCorrect={false}
                    returnKeyType="search"
                    onSubmitEditing={() => Keyboard.dismiss()}
                    disableFullscreenUI
                />
                <View style={styles.linhaBotoes}>
                    <TouchableOpacity style={styles.botaoPrimario} onPress={() => navigation.navigate('FormPonto')}>
                        <Text style={styles.botaoPrimarioTexto}>Novo ponto</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.linhaBotoes}>
                    <TouchableOpacity style={styles.botaoSecundario} onPress={() => navigation.navigate('FormDoacao')}>
                        <Text style={styles.botaoSecundarioTexto}>Registrar doação</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.botaoSecundario} onPress={() => navigation.navigate('MinhasDoacoes')}>
                        <Text style={styles.botaoSecundarioTexto}>Minhas doações</Text>
                    </TouchableOpacity>
                </View>
            </View>
            {renderizarCorpo()}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    topo: { padding: 16, paddingBottom: 8 },
    input: { borderWidth: 1, borderColor: '#CCC', borderRadius: 6, padding: 10, fontSize: 14, width: '100%', marginBottom: 8, minHeight: 44 },
    linhaBotoes: { flexDirection: 'row', gap: 8, marginBottom: 8 },
    botaoPrimario: { flex: 1, backgroundColor: '#1B3A5C', padding: 12, borderRadius: 6, alignItems: 'center', minHeight: 44, justifyContent: 'center' },
    botaoPrimarioTexto: { color: '#fff', fontWeight: 'bold' },
    botaoSecundario: { flex: 1, borderWidth: 1, borderColor: '#1B3A5C', padding: 12, borderRadius: 6, alignItems: 'center', minHeight: 44, justifyContent: 'center' },
    botaoSecundarioTexto: { color: '#1B3A5C', fontWeight: '600' },
    container: { alignItems: 'center', padding: 16 },
    centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
    textoApoio: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 8 },
    erro: { color: '#C62828', fontSize: 14, textAlign: 'center' },
    rodape: { paddingVertical: 16, alignItems: 'center', gap: 8, width: '100%' },
    item: { alignItems: 'center', marginBottom: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#E0E0E0', width: '100%' },
    nome: { fontSize: 16, fontWeight: 'bold', color: '#1B3A5C', textAlign: 'center' },
    endereco: { fontSize: 13, color: '#666', textAlign: 'center', marginTop: 4 },
    tipo: { fontSize: 12, color: '#2E7D32', fontWeight: '600', textAlign: 'center', marginTop: 4 },
});
