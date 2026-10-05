import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { listarDoacoes, Doacao } from './doacoesStorage';

function formatarData(criadoEm: string) {
    const data = new Date(criadoEm);
    return data.toLocaleDateString('pt-BR') + ' às ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

const DoacaoItem = React.memo(function DoacaoItem({
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
            <Text style={styles.data}>{formatarData(doacao.criadoEm)}</Text>
        </TouchableOpacity>
    );
});

export default function TelaMinhasDoacoes({ navigation }: { navigation: any }) {
    const [doacoes, setDoacoes] = React.useState<Doacao[]>([]);
    const [carregando, setCarregando] = React.useState(true);

    useFocusEffect(
        React.useCallback(() => {
            async function carregar() {
                setCarregando(true);
                const lista = await listarDoacoes();
                setDoacoes(lista);
                setCarregando(false);
            }
            carregar();
        }, [])
    );

    if (!carregando && doacoes.length === 0) {
        return (
            <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
                <View style={styles.vazioContainer}>
                    <Text style={styles.vazioTexto}>Você ainda não possui doações registradas.</Text>
                    <TouchableOpacity style={styles.botaoVoltar} onPress={() => navigation.goBack()}>
                        <Text style={styles.botaoVoltarTexto}>Ir para o cadastro</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
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
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    container: { padding: 16 },
    item: {
        marginBottom: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        minHeight: 44,
    },
    tipoItem: { fontSize: 16, fontWeight: 'bold', color: '#1B3A5C' },
    detalhe: { fontSize: 14, color: '#444', marginTop: 2 },
    data: { fontSize: 12, color: '#888', marginTop: 6 },
    vazioContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
    vazioTexto: { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 16 },
    botaoVoltar: { backgroundColor: '#1B3A5C', padding: 12, borderRadius: 6, minHeight: 44, justifyContent: 'center', paddingHorizontal: 20 },
    botaoVoltarTexto: { color: '#fff', fontWeight: 'bold' },
});