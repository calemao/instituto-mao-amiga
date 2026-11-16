import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import BotaoFavorito from './BotaoFavorito';
import { mensagemDoErro, statusDoErro } from './src/services/api';
import { alternar, listarIds } from './src/services/favoritosService';
import { buscarPorId, Ponto } from './src/services/pontosService';

// Os favoritos guardam só o id. Aqui cada ponto é buscado na API pelo id; um ponto que
// foi excluído (404) é pulado, e qualquer outro erro (API fora, por exemplo) é avisado.
export default function TelaMeusPontos({ navigation }: { navigation: any }) {
    const [pontos, setPontos] = useState<Ponto[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    // Número da busca em andamento: respostas de buscas antigas são descartadas.
    const requisicaoAtual = useRef(0);

    const carregar = useCallback(async () => {
        const id = ++requisicaoAtual.current;
        setCarregando(true);
        setErro('');
        try {
            const ids = await listarIds();
            const resultados = await Promise.allSettled(ids.map((favoritoId) => buscarPorId(favoritoId)));
            if (id !== requisicaoAtual.current) return;

            const encontrados: Ponto[] = [];
            let falha: unknown = null;
            for (const resultado of resultados) {
                if (resultado.status === 'fulfilled') {
                    encontrados.push(resultado.value);
                } else if (statusDoErro(resultado.reason) !== 404 && falha === null) {
                    falha = resultado.reason;
                }
            }

            if (falha !== null) {
                setPontos([]);
                setErro(mensagemDoErro(falha));
            } else {
                setPontos(encontrados);
            }
        } catch {
            if (id !== requisicaoAtual.current) return;
            setPontos([]);
            setErro('Não foi possível ler seus favoritos neste aparelho.');
        } finally {
            if (id === requisicaoAtual.current) setCarregando(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            carregar();
        }, [carregar])
    );

    async function desfavoritar(pontoId: string) {
        try {
            await alternar(pontoId);
            setPontos((atual) => atual.filter((ponto) => ponto.id !== pontoId));
        } catch {
            setErro('Não foi possível atualizar seus favoritos neste aparelho.');
        }
    }

    if (carregando) {
        return (
            <View style={styles.centro}>
                <ActivityIndicator size="large" color="#1B3A5C" />
                <Text style={styles.textoApoio}>Carregando seus pontos...</Text>
            </View>
        );
    }

    if (erro !== '') {
        return (
            <View style={styles.centro}>
                <Text style={styles.erro}>{erro}</Text>
                <TouchableOpacity style={styles.botaoSecundario} onPress={carregar}>
                    <Text style={styles.botaoSecundarioTexto}>Tentar novamente</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
            <FlatList
                data={pontos}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.container}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <TouchableOpacity
                            style={styles.itemTexto}
                            onPress={() => navigation.navigate('DetalhePonto', { pontoId: item.id })}
                        >
                            <Text style={styles.nome}>{item.nome}</Text>
                            <Text style={styles.endereco}>{item.endereco}</Text>
                            <Text style={styles.tipo}>{item.bairro} · {item.tipo}</Text>
                        </TouchableOpacity>
                        <BotaoFavorito favorito onPress={() => desfavoritar(item.id)} />
                    </View>
                )}
                ListEmptyComponent={
                    <View style={styles.vazio}>
                        <Text style={styles.textoApoio}>
                            Você ainda não favoritou nenhum ponto. Toque no ♡ de um ponto para guardá-lo aqui.
                        </Text>
                        <TouchableOpacity style={styles.botaoSecundario} onPress={() => navigation.goBack()}>
                            <Text style={styles.botaoSecundarioTexto}>Ver pontos</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    container: { padding: 16, flexGrow: 1 },
    centro: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
    vazio: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
    textoApoio: { fontSize: 14, color: '#666', textAlign: 'center' },
    erro: { color: '#C62828', fontSize: 14, textAlign: 'center' },
    botaoSecundario: { borderWidth: 1, borderColor: '#1B3A5C', padding: 12, borderRadius: 6, alignItems: 'center', minHeight: 44, justifyContent: 'center', paddingHorizontal: 20 },
    botaoSecundarioTexto: { color: '#1B3A5C', fontWeight: '600' },
    item: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
    itemTexto: { flex: 1, minHeight: 44, justifyContent: 'center' },
    nome: { fontSize: 16, fontWeight: 'bold', color: '#1B3A5C' },
    endereco: { fontSize: 13, color: '#666', marginTop: 4 },
    tipo: { fontSize: 12, color: '#2E7D32', fontWeight: '600', marginTop: 4 },
});
