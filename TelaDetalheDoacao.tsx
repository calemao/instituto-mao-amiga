import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { mensagemDoErro, statusDoErro } from './src/services/api';
import { buscarPorId, Doacao, excluir, formatarDataDoacao } from './src/services/doacoesService';

const NAO_ENCONTRADA = 'Doação não encontrada.';

// Recebe só o id pela navegação e busca a doação na API: os dados nunca vêm da tela anterior.
export default function TelaDetalheDoacao({ route, navigation }: { route: any; navigation: any }) {
    const { doacaoId } = route.params;
    const [doacao, setDoacao] = useState<Doacao | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [excluindo, setExcluindo] = useState(false);
    const [erroAcao, setErroAcao] = useState('');

    // Número da busca em andamento: respostas de buscas antigas são descartadas.
    const requisicaoAtual = useRef(0);

    const carregar = useCallback(async () => {
        const id = ++requisicaoAtual.current;
        setCarregando(true);
        setErro('');
        try {
            const encontrada = await buscarPorId(doacaoId);
            if (id !== requisicaoAtual.current) return;
            setDoacao(encontrada);
        } catch (e) {
            if (id !== requisicaoAtual.current) return;
            setDoacao(null);
            setErro(statusDoErro(e) === 404 ? NAO_ENCONTRADA : mensagemDoErro(e));
        } finally {
            if (id === requisicaoAtual.current) setCarregando(false);
        }
    }, [doacaoId]);

    // Busca de novo toda vez que a tela volta ao foco, por exemplo depois de editar.
    useFocusEffect(
        useCallback(() => {
            carregar();
        }, [carregar])
    );

    function confirmarExclusao() {
        if (!doacao || excluindo) return;
        Alert.alert(
            'Excluir doação',
            'Tem certeza que deseja excluir esta doação? Essa ação não pode ser desfeita.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        setErroAcao('');
                        setExcluindo(true);
                        try {
                            await excluir(doacao.id);
                            navigation.goBack();
                        } catch (e) {
                            // Falhou: continua na tela e avisa, sem fingir que excluiu.
                            setErroAcao(
                                statusDoErro(e) === 404
                                    ? 'Esta doação já não existe mais.'
                                    : mensagemDoErro(e)
                            );
                            setExcluindo(false);
                        }
                    },
                },
            ]
        );
    }

    if (carregando && doacao === null) {
        return (
            <View style={styles.centro}>
                <ActivityIndicator size="large" color="#1B3A5C" />
                <Text style={styles.textoApoio}>Carregando doação...</Text>
            </View>
        );
    }

    if (erro !== '' || doacao === null) {
        return (
            <View style={styles.centro}>
                <Text style={styles.erro}>{erro !== '' ? erro : NAO_ENCONTRADA}</Text>
                {erro !== NAO_ENCONTRADA && (
                    <TouchableOpacity style={styles.botaoSecundario} onPress={carregar}>
                        <Text style={styles.botaoSecundarioTexto}>Tentar novamente</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.botaoSecundario} onPress={() => navigation.goBack()}>
                    <Text style={styles.botaoSecundarioTexto}>Voltar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.label}>Tipo do item</Text>
                <Text style={styles.valor}>{doacao.tipoItem}</Text>

                <Text style={styles.label}>Quantidade</Text>
                <Text style={styles.valor}>{doacao.quantidade}</Text>

                <Text style={styles.label}>Ponto de destino</Text>
                <Text style={styles.valor}>{doacao.pontoDestino}</Text>

                <Text style={styles.label}>Registrado em</Text>
                <Text style={styles.valor}>{formatarDataDoacao(doacao.criadoEm)}</Text>

                <Text style={styles.label}>ID</Text>
                <Text style={styles.valorPequeno}>{doacao.id}</Text>

                {erroAcao !== '' && <Text style={styles.erroAcao}>{erroAcao}</Text>}

                <TouchableOpacity
                    style={[styles.botaoEditar, excluindo && styles.botaoDesabilitado]}
                    onPress={() => navigation.navigate('FormDoacao', { doacaoId: doacao.id })}
                    disabled={excluindo}
                >
                    <Text style={styles.botaoEditarTexto}>Editar doação</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.botaoExcluir, excluindo && styles.botaoDesabilitado]}
                    onPress={confirmarExclusao}
                    disabled={excluindo}
                >
                    {excluindo ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.botaoExcluirTexto}>Excluir doação</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    container: { padding: 20 },
    centro: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
    textoApoio: { fontSize: 14, color: '#666', textAlign: 'center' },
    erro: { color: '#C62828', fontSize: 14, textAlign: 'center' },
    erroAcao: { color: '#C62828', fontSize: 13, marginTop: 20 },
    label: { fontSize: 13, color: '#888', marginTop: 16 },
    valor: { fontSize: 18, fontWeight: '600', color: '#1B3A5C', marginTop: 2 },
    valorPequeno: { fontSize: 12, color: '#999', marginTop: 2 },
    botaoSecundario: { borderWidth: 1, borderColor: '#1B3A5C', padding: 12, borderRadius: 6, alignItems: 'center', minHeight: 44, justifyContent: 'center', paddingHorizontal: 20 },
    botaoSecundarioTexto: { color: '#1B3A5C', fontWeight: '600' },
    botaoEditar: { backgroundColor: '#1B3A5C', padding: 12, borderRadius: 6, alignItems: 'center', marginTop: 32, minHeight: 44, justifyContent: 'center' },
    botaoEditarTexto: { color: '#fff', fontWeight: 'bold' },
    botaoExcluir: { backgroundColor: '#C62828', padding: 12, borderRadius: 6, alignItems: 'center', marginTop: 12, minHeight: 44, justifyContent: 'center' },
    botaoExcluirTexto: { color: '#fff', fontWeight: 'bold' },
    botaoDesabilitado: { opacity: 0.6 },
});
