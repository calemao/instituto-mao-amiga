import AsyncStorage from '@react-native-async-storage/async-storage';

// Só os ids dos pontos favoritos ficam no aparelho. Nome, endereço e o resto
// são sempre buscados na API, então nunca aparece uma cópia velha de um ponto.
const CHAVE_FAVORITOS = '@instituto_mao_amiga:pontos_favoritos';

export async function listarIds(): Promise<string[]> {
    const salvo = await AsyncStorage.getItem(CHAVE_FAVORITOS);
    if (salvo === null) return [];
    try {
        const dados: unknown = JSON.parse(salvo);
        return Array.isArray(dados) ? dados.filter((id): id is string => typeof id === 'string') : [];
    } catch {
        return [];
    }
}

// Cliques seguidos entram numa fila: cada um lê a lista já atualizada pelo anterior.
let fila: Promise<unknown> = Promise.resolve();

async function alternarAgora(id: string): Promise<boolean> {
    const ids = await listarIds();
    const eraFavorito = ids.includes(id);
    const novos = eraFavorito ? ids.filter((atual) => atual !== id) : [...ids, id];
    await AsyncStorage.setItem(CHAVE_FAVORITOS, JSON.stringify(novos));
    return !eraFavorito;
}

// Favorita se não era, desfavorita se era. Devolve o estado novo (true = favorito).
export function alternar(id: string): Promise<boolean> {
    const resultado = fila.then(() => alternarAgora(id));
    fila = resultado.catch(() => undefined);
    return resultado;
}
