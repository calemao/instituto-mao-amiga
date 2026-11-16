import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { mensagemDoErro, statusDoErro } from './src/services/api';
import { buscarPorId, Ponto } from './src/services/pontosService';

export default function TelaDetalhePonto({ route }: { route: any }) {
    const { pontoId } = route.params;
    const [ponto, setPonto] = useState<Ponto | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

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
        }, [carregar])
    );

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
            <Text style={styles.nome}>{ponto.nome}</Text>
            <Text style={styles.endereco}>{ponto.endereco}</Text>
            <Text style={styles.detalhe}>Bairro: {ponto.bairro}</Text>
            <Text style={styles.detalhe}>{ponto.horario}</Text>
            <Text style={styles.tipo}>Ponto de {ponto.tipo}</Text>
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
    botaoSecundario: { borderWidth: 1, borderColor: '#1B3A5C', padding: 12, borderRadius: 6, alignItems: 'center', minHeight: 44, justifyContent: 'center', minWidth: 180 },
    botaoSecundarioTexto: { color: '#1B3A5C', fontWeight: '600' },
});
