import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import BotaoFavorito from './BotaoFavorito';
import { mensagemDoErro, statusDoErro } from './src/services/api';
import { alternar, listarIds } from './src/services/favoritosService';
import { buscarPorId, excluir, Ponto } from './src/services/pontosService';

export default function TelaDetalhePonto({ navigation, route }: { navigation: any; route: any }) {
    const { pontoId } = route.params;
    const [ponto, setPonto] = useState<Ponto | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [erroAcao, setErroAcao] = useState('');
    const [excluindo, setExcluindo] = useState(false);
    const [favorito, setFavorito] = useState(false);

    const carregar = useCallback(async () => {
        try {
            setPonto(await buscarPorId(pontoId));
            setErro('');
        } catch (e) {
            setPonto(null);
            setErro(statusDoErro(e) === 404 ? 'Ponto não encontrado.' : mensagemDoErro(e));
        } finally {
            setCarregando(false);
        }
    }, [pontoId]);

    // Busca o ponto na API toda vez que a tela ganha foco, para mostrar valores atuais.
    useFocusEffect(
        useCallback(() => {
            carregar();
            listarIds()
                .then((ids) => setFavorito(ids.includes(pontoId)))
                .catch(() => {});
        }, [carregar, pontoId])
    );

    async function alternarFavorito() {
        try {
            setFavorito(await alternar(pontoId));
        } catch {
            // não conseguiu gravar no aparelho: o coração continua como estava
        }
    }

    function pedirConfirmacaoExclusao() {
        if (!ponto) return;
        Alert.alert('Excluir ponto', `Deseja excluir "${ponto.nome}"? Essa ação não pode ser desfeita.`, [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Excluir', style: 'destructive', onPress: confirmarExclusao },
        ]);
    }

    async function confirmarExclusao() {
        setErroAcao('');
        setExcluindo(true);
        try {
            await excluir(pontoId);
            navigation.goBack();
        } catch (e) {
            // Falhou: avisa e permanece na tela, sem fingir que o ponto foi excluído.
            setErroAcao(mensagemDoErro(e));
        } finally {
            setExcluindo(false);
        }
    }

    if (carregando) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#1B3A5C" />
            </View>
        );
    }

    if (erro !== '' || !ponto) {
        return (
            <View style={styles.container}>
                <Text style={styles.erro}>{erro || 'Ponto não encontrado.'}</Text>
                {erro !== 'Ponto não encontrado.' && (
                    <TouchableOpacity
                        style={styles.botaoSecundario}
                        onPress={() => {
                            setCarregando(true);
                            carregar();
                        }}
                    >
                        <Text style={styles.botaoSecundarioTexto}>Tentar novamente</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <BotaoFavorito favorito={favorito} onPress={alternarFavorito} />
            <Text style={styles.nome}>{ponto.nome}</Text>
            <Text style={styles.endereco}>{ponto.endereco}</Text>
            <Text style={styles.detalhe}>Bairro: {ponto.bairro}</Text>
            <Text style={styles.detalhe}>{ponto.horario}</Text>
            <Text style={styles.tipo}>Ponto de {ponto.tipo}</Text>

            {erroAcao !== '' && <Text style={styles.erro}>{erroAcao}</Text>}

            <TouchableOpacity
                style={styles.botaoPrimario}
                onPress={() => navigation.navigate('FormPonto', { pontoId: ponto.id })}
            >
                <Text style={styles.botaoPrimarioTexto}>Editar ponto</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.botaoExcluir, excluindo && styles.botaoDesabilitado]}
                onPress={pedirConfirmacaoExclusao}
                disabled={excluindo}
            >
                {excluindo ? (
                    <ActivityIndicator color="#C62828" />
                ) : (
                    <Text style={styles.botaoExcluirTexto}>Excluir ponto</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 24 },
    nome: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: '#1B3A5C', marginBottom: 12 },
    endereco: { fontSize: 15, textAlign: 'center', color: '#333', marginBottom: 8 },
    detalhe: { fontSize: 14, textAlign: 'center', color: '#555', marginBottom: 8 },
    tipo: { fontSize: 14, fontWeight: '600', textAlign: 'center', color: '#2E7D32', marginTop: 8 },
    erro: { color: '#C62828', fontSize: 15, textAlign: 'center', marginBottom: 12 },
    botaoPrimario: { backgroundColor: '#1B3A5C', padding: 12, borderRadius: 6, alignItems: 'center', minHeight: 44, justifyContent: 'center', width: '100%', marginTop: 16 },
    botaoPrimarioTexto: { color: '#fff', fontWeight: 'bold' },
    botaoExcluir: { borderWidth: 1, borderColor: '#C62828', padding: 12, borderRadius: 6, alignItems: 'center', minHeight: 44, justifyContent: 'center', width: '100%', marginTop: 8 },
    botaoExcluirTexto: { color: '#C62828', fontWeight: '600' },
    botaoDesabilitado: { opacity: 0.6 },
    botaoSecundario: { borderWidth: 1, borderColor: '#1B3A5C', padding: 12, borderRadius: 6, alignItems: 'center', minHeight: 44, justifyContent: 'center', minWidth: 180 },
    botaoSecundarioTexto: { color: '#1B3A5C', fontWeight: '600' },
});
