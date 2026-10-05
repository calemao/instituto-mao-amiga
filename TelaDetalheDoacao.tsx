import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Doacao, listarDoacoes, excluirDoacao } from './doacoesStorage';

function formatarData(criadoEm: string) {
    const data = new Date(criadoEm);
    return data.toLocaleDateString('pt-BR') + ' às ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function TelaDetalheDoacao({ route, navigation }: { route: any; navigation: any }) {
    const { doacaoId } = route.params;
    const [doacao, setDoacao] = React.useState<Doacao | null>(null);

    useFocusEffect(
        React.useCallback(() => {
            async function carregar() {
                const lista = await listarDoacoes();
                const encontrada = lista.find((d) => d.id === doacaoId) ?? null;
                setDoacao(encontrada);
            }
            carregar();
        }, [doacaoId])
    );

    function confirmarExclusao() {
        if (!doacao) return;
        Alert.alert(
            'Excluir doação',
            'Tem certeza que deseja excluir esta doação? Essa ação não pode ser desfeita.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        await excluirDoacao(doacao.id);
                        navigation.goBack();
                    },
                },
            ]
        );
    }

    if (!doacao) {
        return (
            <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
                <ScrollView contentContainerStyle={styles.container}>
                    <Text style={styles.valor}>Carregando...</Text>
                </ScrollView>
            </SafeAreaView>
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
                <Text style={styles.valor}>{formatarData(doacao.criadoEm)}</Text>

                <Text style={styles.label}>ID</Text>
                <Text style={styles.valorPequeno}>{doacao.id}</Text>

                <TouchableOpacity
                    style={styles.botaoEditar}
                    onPress={() => navigation.push('ListaPontos', { doacaoParaEditar: doacao })}
                >
                    <Text style={styles.botaoEditarTexto}>Editar doação</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.botaoExcluir} onPress={confirmarExclusao}>
                    <Text style={styles.botaoExcluirTexto}>Excluir doação</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    container: { padding: 20 },
    label: { fontSize: 13, color: '#888', marginTop: 16 },
    valor: { fontSize: 18, fontWeight: '600', color: '#1B3A5C', marginTop: 2 },
    valorPequeno: { fontSize: 12, color: '#999', marginTop: 2 },
    botaoEditar: { backgroundColor: '#1B3A5C', padding: 12, borderRadius: 6, alignItems: 'center', marginTop: 32, minHeight: 44, justifyContent: 'center' },
    botaoEditarTexto: { color: '#fff', fontWeight: 'bold' },
    botaoExcluir: { backgroundColor: '#C62828', padding: 12, borderRadius: 6, alignItems: 'center', marginTop: 12, minHeight: 44, justifyContent: 'center' },
    botaoExcluirTexto: { color: '#fff', fontWeight: 'bold' },
});