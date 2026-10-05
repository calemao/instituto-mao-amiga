import React from 'react';
import { FlatList, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
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

type TotalPorTipo = { tipo: string; quantidade: number; doacoes: number };

function calcularTotaisPorTipo(doacoes: Doacao[]): TotalPorTipo[] {
    const mapa = new Map<string, TotalPorTipo>();

    for (const doacao of doacoes) {
        const chave = doacao.tipoItem.trim().toLowerCase();
        const existente = mapa.get(chave);
        if (existente) {
            existente.quantidade += doacao.quantidade;
            existente.doacoes += 1;
        } else {
            mapa.set(chave, { tipo: doacao.tipoItem, quantidade: doacao.quantidade, doacoes: 1 });
        }
    }

    return Array.from(mapa.values()).sort((a, b) => b.quantidade - a.quantidade);
}

function Resumo({ doacoes }: { doacoes: Doacao[] }) {
    const totais = calcularTotaisPorTipo(doacoes);

    return (
        <View style={styles.resumoContainer}>
            <Text style={styles.resumoTitulo}>Resumo</Text>
            <Text style={styles.resumoTotal}>Total de doações: {doacoes.length}</Text>

            {totais.map((item) => (
                <View key={item.tipo} style={styles.resumoLinha}>
                    <Text style={styles.resumoTipo}>{item.tipo}</Text>
                    <Text style={styles.resumoDetalhe}>
                        {item.quantidade} {item.quantidade === 1 ? 'unidade' : 'unidades'} · {item.doacoes} {item.doacoes === 1 ? 'doação' : 'doações'}
                    </Text>
                </View>
            ))}
        </View>
    );
}

export default function TelaMinhasDoacoes({ navigation }: { navigation: any }) {
    const [doacoes, setDoacoes] = React.useState<Doacao[]>([]);
    const [carregando, setCarregando] = React.useState(true);
    const [busca, setBusca] = React.useState('');

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

    const doacoesFiltradas = doacoes.filter((doacao) =>
        doacao.tipoItem.toLowerCase().includes(busca.trim().toLowerCase())
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
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.flex}>
                        <View style={styles.buscaContainer}>
                            <TextInput
                                style={styles.inputBusca}
                                placeholder="🔎 Buscar por tipo de item"
                                value={busca}
                                onChangeText={setBusca}
                                disableFullscreenUI
                            />
                        </View>

                        {doacoesFiltradas.length === 0 ? (
                            <View style={styles.vazioContainer}>
                                <Text style={styles.vazioTexto}>
                                    Nenhuma doação encontrada para "{busca}".
                                </Text>
                            </View>
                        ) : (
                            <FlatList
                                data={doacoesFiltradas}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <DoacaoItem
                                        doacao={item}
                                        onPress={() => navigation.navigate('DetalheDoacao', { doacaoId: item.id })}
                                    />
                                )}
                                contentContainerStyle={styles.container}
                                keyboardShouldPersistTaps="handled"
                                ListHeaderComponent={<Resumo doacoes={doacoes} />}
                            />
                        )}
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    flex: { flex: 1 },
    buscaContainer: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
    inputBusca: { borderWidth: 1, borderColor: '#CCC', borderRadius: 6, padding: 10, fontSize: 14, minHeight: 44 },
    container: { padding: 16, paddingTop: 0 },
    resumoContainer: {
        backgroundColor: '#F5F7FA',
        borderRadius: 8,
        padding: 14,
        marginBottom: 16,
    },
    resumoTitulo: { fontSize: 16, fontWeight: 'bold', color: '#1B3A5C', marginBottom: 4 },
    resumoTotal: { fontSize: 14, color: '#444', marginBottom: 8 },
    resumoLinha: { marginTop: 6 },
    resumoTipo: { fontSize: 14, fontWeight: '600', color: '#1B3A5C' },
    resumoDetalhe: { fontSize: 13, color: '#666' },
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