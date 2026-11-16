import { useEffect, useState } from 'react';
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { camposDoErro, mensagemDoErro, statusDoErro } from './src/services/api';
import { buscarPorId, cadastrar, editar, TipoPonto } from './src/services/pontosService';

const TIPOS: TipoPonto[] = ['coleta', 'distribuição'];

// Mesmo formulário para cadastrar e editar: com `pontoId` na navegação ele abre em modo edição.
export default function TelaFormPonto({ navigation, route }: { navigation: any; route: any }) {
    const pontoId: string | undefined = route?.params?.pontoId;
    const editando = pontoId !== undefined;

    const [nome, setNome] = useState('');
    const [endereco, setEndereco] = useState('');
    const [bairro, setBairro] = useState('');
    const [horario, setHorario] = useState('');
    const [tipo, setTipo] = useState<TipoPonto | null>(null);
    const [erro, setErro] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [carregando, setCarregando] = useState(editando);
    const [erroCarga, setErroCarga] = useState('');

    async function carregarPonto() {
        if (pontoId === undefined) return;
        setCarregando(true);
        setErroCarga('');
        try {
            const ponto = await buscarPorId(pontoId);
            setNome(ponto.nome);
            setEndereco(ponto.endereco);
            setBairro(ponto.bairro);
            setHorario(ponto.horario);
            setTipo(ponto.tipo);
        } catch (e) {
            setErroCarga(statusDoErro(e) === 404 ? 'Ponto não encontrado.' : mensagemDoErro(e));
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        if (editando) {
            navigation.setOptions({ title: 'Editar ponto' });
            carregarPonto();
        }
    }, []);

    async function salvar() {
        if (enviando) return;

        const dadosNome = nome.trim();
        const dadosEndereco = endereco.trim();
        const dadosBairro = bairro.trim();
        const dadosHorario = horario.trim();

        if (dadosNome === '') return setErro('Informe o nome do ponto.');
        if (dadosEndereco === '') return setErro('Informe o endereço do ponto.');
        if (dadosBairro === '') return setErro('Informe o bairro do ponto.');
        if (dadosHorario === '') return setErro('Informe o horário de funcionamento.');
        if (tipo === null) return setErro('Escolha o tipo do ponto: coleta ou distribuição.');

        const dados = {
            nome: dadosNome,
            endereco: dadosEndereco,
            bairro: dadosBairro,
            horario: dadosHorario,
            tipo,
        };

        setErro('');
        setEnviando(true);
        try {
            if (pontoId !== undefined) {
                await editar(pontoId, dados);
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
            </View>
        );
    }

    if (erroCarga !== '') {
        return (
            <View style={styles.centro}>
                <Text style={styles.erro}>{erroCarga}</Text>
                {erroCarga !== 'Ponto não encontrado.' && (
                    <TouchableOpacity style={styles.botaoCancelar} onPress={carregarPonto}>
                        <Text style={styles.botaoCancelarTexto}>Tentar novamente</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                    <Text style={styles.titulo}>{editando ? 'Editar ponto' : 'Cadastrar ponto'}</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Nome (ex.: Ponto de Coleta Setor Bueno)"
                        value={nome}
                        onChangeText={setNome}
                        disableFullscreenUI
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Endereço (ex.: Rua T-30, nº 1200, Goiânia-GO)"
                        value={endereco}
                        onChangeText={setEndereco}
                        disableFullscreenUI
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Bairro (ex.: Setor Bueno)"
                        value={bairro}
                        onChangeText={setBairro}
                        disableFullscreenUI
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Horário (ex.: Seg a Sex, 8h às 17h)"
                        value={horario}
                        onChangeText={setHorario}
                        disableFullscreenUI
                    />

                    <Text style={styles.rotulo}>Tipo do ponto</Text>
                    <View style={styles.linhaTipos}>
                        {TIPOS.map((opcao) => (
                            <TouchableOpacity
                                key={opcao}
                                style={[styles.botaoTipo, tipo === opcao && styles.botaoTipoSelecionado]}
                                onPress={() => setTipo(opcao)}
                            >
                                <Text style={[styles.botaoTipoTexto, tipo === opcao && styles.botaoTipoTextoSelecionado]}>
                                    {opcao}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

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
                                {editando ? 'Salvar alterações' : 'Cadastrar ponto'}
                            </Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.botaoCancelar} onPress={() => navigation.goBack()}>
                        <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
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
    titulo: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, alignSelf: 'flex-start' },
    input: { borderWidth: 1, borderColor: '#CCC', borderRadius: 6, padding: 10, fontSize: 14, width: '100%', marginBottom: 8, minHeight: 44 },
    rotulo: { fontSize: 14, fontWeight: '600', color: '#333', alignSelf: 'flex-start', marginBottom: 6, marginTop: 4 },
    linhaTipos: { flexDirection: 'row', gap: 8, width: '100%', marginBottom: 12 },
    botaoTipo: { flex: 1, borderWidth: 1, borderColor: '#1B3A5C', padding: 12, borderRadius: 6, alignItems: 'center', minHeight: 44, justifyContent: 'center' },
    botaoTipoSelecionado: { backgroundColor: '#1B3A5C' },
    botaoTipoTexto: { color: '#1B3A5C', fontWeight: '600' },
    botaoTipoTextoSelecionado: { color: '#fff' },
    erro: { color: '#C62828', fontSize: 13, marginBottom: 8, alignSelf: 'flex-start' },
    botaoSalvar: { backgroundColor: '#1B3A5C', padding: 12, borderRadius: 6, alignItems: 'center', width: '100%', minHeight: 44, justifyContent: 'center' },
    botaoSalvarTexto: { color: '#fff', fontWeight: 'bold' },
    botaoDesabilitado: { opacity: 0.6 },
    botaoCancelar: { borderWidth: 1, borderColor: '#999', padding: 12, borderRadius: 6, alignItems: 'center', width: '100%', marginTop: 8, minHeight: 44, justifyContent: 'center' },
    botaoCancelarTexto: { color: '#555', fontWeight: '600' },
});
