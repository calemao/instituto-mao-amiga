import { useCallback, useEffect, useRef, useState, type ComponentRef } from 'react';
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { camposDoErro, mensagemDoErro, statusDoErro } from './src/services/api';
import { cadastrar, buscarPorId, editar } from './src/services/doacoesService';
import { listar as listarPontos, Ponto } from './src/services/pontosService';

const NAO_ENCONTRADA = 'Doação não encontrada.';

// Mesmo formulário para registrar e editar: com `doacaoId` na navegação ele abre em modo edição.
export default function TelaFormDoacao({ navigation, route }: { navigation: any; route: any }) {
    const doacaoId: string | undefined = route?.params?.doacaoId;
    const editando = doacaoId !== undefined;

    const [tipoItem, setTipoItem] = useState('');
    const [quantidadeInput, setQuantidadeInput] = useState('');
    const [pontoDestino, setPontoDestino] = useState('');
    const [erro, setErro] = useState('');
    const [enviando, setEnviando] = useState(false);

    const [pontos, setPontos] = useState<Ponto[]>([]);
    const [carregandoPontos, setCarregandoPontos] = useState(true);
    const [erroPontos, setErroPontos] = useState('');

    const [carregando, setCarregando] = useState(editando);
    const [erroCarga, setErroCarga] = useState('');

    const quantidadeRef = useRef<ComponentRef<typeof TextInput>>(null);
    const [tecladoAberto, setTecladoAberto] = useState(false);

    // O teclado numérico não tem tecla de confirmar, então a barra "Fechar teclado"
    // aparece enquanto ele está aberto para sempre haver um jeito de acessar os botões.
    useEffect(() => {
        const abriu = Keyboard.addListener('keyboardDidShow', () => setTecladoAberto(true));
        const fechou = Keyboard.addListener('keyboardDidHide', () => setTecladoAberto(false));
        return () => {
            abriu.remove();
            fechou.remove();
        };
    }, []);

    const carregarPontos = useCallback(async () => {
        setCarregandoPontos(true);
        setErroPontos('');
        try {
            setPontos(await listarPontos());
        } catch (e) {
            setErroPontos(mensagemDoErro(e));
        } finally {
            setCarregandoPontos(false);
        }
    }, []);

    async function carregarDoacao() {
        if (doacaoId === undefined) return;
        setCarregando(true);
        setErroCarga('');
        try {
            const doacao = await buscarPorId(doacaoId);
            setTipoItem(doacao.tipoItem);
            setQuantidadeInput(String(doacao.quantidade));
            setPontoDestino(doacao.pontoDestino);
        } catch (e) {
            setErroCarga(statusDoErro(e) === 404 ? NAO_ENCONTRADA : mensagemDoErro(e));
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        carregarPontos();
        if (editando) {
            navigation.setOptions({ title: 'Editar doação' });
            carregarDoacao();
        }
    }, []);

    async function salvar() {
        if (enviando) return;

        const dadosTipo = tipoItem.trim();
        if (dadosTipo === '') return setErro('Informe o tipo do item doado.');

        const quantidadeNumerica = Number(quantidadeInput.trim());
        if (
            quantidadeInput.trim() === '' ||
            isNaN(quantidadeNumerica) ||
            !Number.isInteger(quantidadeNumerica) ||
            quantidadeNumerica <= 0
        ) {
            return setErro('A quantidade precisa ser um número inteiro maior que zero (ex.: 3).');
        }

        if (pontoDestino === '') return setErro('Escolha o ponto de destino da doação.');

        const dados = { tipoItem: dadosTipo, quantidade: quantidadeNumerica, pontoDestino };

        setErro('');
        setEnviando(true);
        try {
            if (doacaoId !== undefined) {
                await editar(doacaoId, dados);
            } else {
                await cadastrar(dados);
            }
            Keyboard.dismiss();
            navigation.goBack();
        } catch (e) {
            // Falhou: avisa e mantém tudo o que foi digitado, sem fingir que deu certo.
            const campos = camposDoErro(e);
            setErro(campos ? Object.values(campos).join('\n') : mensagemDoErro(e));
        } finally {
            setEnviando(false);
        }
    }

    if (carregando) {
        return (
            <View style={styles.centro}>
                <ActivityIndicator size="large" color="#1B3A5C" />
                <Text style={styles.textoApoio}>Carregando doação...</Text>
            </View>
        );
    }

    if (erroCarga !== '') {
        return (
            <View style={styles.centro}>
                <Text style={styles.erroCentro}>{erroCarga}</Text>
                {erroCarga !== NAO_ENCONTRADA && (
                    <TouchableOpacity style={styles.botaoCancelar} onPress={carregarDoacao}>
                        <Text style={styles.botaoCancelarTexto}>Tentar novamente</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.botaoCancelar} onPress={() => navigation.goBack()}>
                    <Text style={styles.botaoCancelarTexto}>Voltar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Se o ponto da doação foi excluído depois, ele continua aparecendo para o nome não se perder.
    const destinoForaDaLista =
        pontoDestino !== '' && !pontos.some((p) => p.nome === pontoDestino);

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior="padding"
            >
                {tecladoAberto && (
                    <TouchableOpacity style={styles.fecharTeclado} onPress={Keyboard.dismiss}>
                        <Text style={styles.fecharTecladoTexto}>Fechar teclado</Text>
                    </TouchableOpacity>
                )}
                <ScrollView
                    contentContainerStyle={styles.container}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                >
                    <Text style={styles.titulo}>{editando ? 'Editar doação' : 'Registrar doação'}</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Tipo do item (ex.: roupas, alimentos)"
                        value={tipoItem}
                        onChangeText={setTipoItem}
                        returnKeyType="next"
                        onSubmitEditing={() => quantidadeRef.current?.focus()}
                        disableFullscreenUI
                    />

                    <TextInput
                        ref={quantidadeRef}
                        style={styles.input}
                        placeholder="Quantidade (ex.: 3)"
                        value={quantidadeInput}
                        onChangeText={setQuantidadeInput}
                        keyboardType="number-pad"
                        returnKeyType="done"
                        onSubmitEditing={() => Keyboard.dismiss()}
                        disableFullscreenUI
                    />

                    <Text style={styles.rotulo}>Ponto de destino</Text>

                    {carregandoPontos && (
                        <View style={styles.linhaApoio}>
                            <ActivityIndicator color="#1B3A5C" />
                            <Text style={styles.textoApoio}>Carregando pontos...</Text>
                        </View>
                    )}

                    {!carregandoPontos && erroPontos !== '' && (
                        <View style={styles.blocoErroPontos}>
                            <Text style={styles.erro}>{erroPontos}</Text>
                            <TouchableOpacity style={styles.botaoCancelar} onPress={carregarPontos}>
                                <Text style={styles.botaoCancelarTexto}>Tentar novamente</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {!carregandoPontos && erroPontos === '' && pontos.length === 0 && !destinoForaDaLista && (
                        <Text style={styles.textoApoio}>
                            Nenhum ponto cadastrado. Cadastre um ponto antes de registrar a doação.
                        </Text>
                    )}

                    {destinoForaDaLista && (
                        <TouchableOpacity style={[styles.opcaoPonto, styles.opcaoPontoSelecionada]} disabled>
                            <Text style={[styles.opcaoNome, styles.opcaoTextoSelecionado]}>{pontoDestino}</Text>
                            <Text style={[styles.opcaoBairro, styles.opcaoTextoSelecionado]}>
                                Este ponto não está mais na lista
                            </Text>
                        </TouchableOpacity>
                    )}

                    {pontos.map((ponto) => {
                        const selecionado = pontoDestino === ponto.nome;
                        return (
                            <TouchableOpacity
                                key={ponto.id}
                                style={[styles.opcaoPonto, selecionado && styles.opcaoPontoSelecionada]}
                                onPress={() => setPontoDestino(ponto.nome)}
                            >
                                <Text style={[styles.opcaoNome, selecionado && styles.opcaoTextoSelecionado]}>
                                    {ponto.nome}
                                </Text>
                                <Text style={[styles.opcaoBairro, selecionado && styles.opcaoTextoSelecionado]}>
                                    {ponto.bairro}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}

                    {erro !== '' && <Text style={styles.erro}>{erro}</Text>}

                    <TouchableOpacity
                        style={[styles.botaoSalvar, enviando && styles.botaoDesabilitado]}
                        onPress={salvar}
                        disabled={enviando}
                    >
                        {enviando ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.botaoSalvarTexto}>
                                {editando ? 'Salvar alterações' : 'Registrar doação'}
                            </Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.botaoCancelar} onPress={() => navigation.goBack()}>
                        <Text style={styles.botaoCancelarTexto}>{editando ? 'Cancelar edição' : 'Cancelar'}</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    flex: { flex: 1 },
    container: { alignItems: 'center', padding: 16 },
    centro: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
    fecharTeclado: { backgroundColor: '#E8EEF4', paddingVertical: 10, alignItems: 'center', minHeight: 44, justifyContent: 'center' },
    fecharTecladoTexto: { color: '#1B3A5C', fontWeight: 'bold' },
    titulo: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, alignSelf: 'flex-start' },
    input: { borderWidth: 1, borderColor: '#CCC', borderRadius: 6, padding: 10, fontSize: 14, width: '100%', marginBottom: 8, minHeight: 44 },
    rotulo: { fontSize: 14, fontWeight: '600', color: '#333', alignSelf: 'flex-start', marginBottom: 6, marginTop: 4 },
    linhaApoio: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', marginBottom: 8 },
    blocoErroPontos: { width: '100%', marginBottom: 8 },
    textoApoio: { fontSize: 14, color: '#666', marginBottom: 8, alignSelf: 'flex-start' },
    opcaoPonto: { borderWidth: 1, borderColor: '#CCC', borderRadius: 6, padding: 10, width: '100%', marginBottom: 8, minHeight: 44, justifyContent: 'center' },
    opcaoPontoSelecionada: { backgroundColor: '#1B3A5C', borderColor: '#1B3A5C' },
    opcaoNome: { fontSize: 14, fontWeight: '600', color: '#1B3A5C' },
    opcaoBairro: { fontSize: 12, color: '#666', marginTop: 2 },
    opcaoTextoSelecionado: { color: '#fff' },
    erro: { color: '#C62828', fontSize: 13, marginBottom: 8, alignSelf: 'flex-start' },
    erroCentro: { color: '#C62828', fontSize: 14, textAlign: 'center' },
    botaoSalvar: { backgroundColor: '#1B3A5C', padding: 12, borderRadius: 6, alignItems: 'center', width: '100%', minHeight: 44, justifyContent: 'center', marginTop: 4 },
    botaoSalvarTexto: { color: '#fff', fontWeight: 'bold' },
    botaoDesabilitado: { opacity: 0.6 },
    botaoCancelar: { borderWidth: 1, borderColor: '#999', padding: 12, borderRadius: 6, alignItems: 'center', width: '100%', marginTop: 8, minHeight: 44, justifyContent: 'center' },
    botaoCancelarTexto: { color: '#555', fontWeight: '600' },
});
