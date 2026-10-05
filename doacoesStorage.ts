import AsyncStorage from '@react-native-async-storage/async-storage';

export type Doacao = {
    id: string;
    tipoItem: string;
    quantidade: number;
    pontoDestino: string;
    criadoEm: string;
};

const CHAVE_DOACOES = '@instituto_mao_amiga:doacoes';

export async function listarDoacoes(): Promise<Doacao[]> {
    const doacoesSalvas = await AsyncStorage.getItem(CHAVE_DOACOES);
    if (doacoesSalvas === null) {
        return [];
    }
    return JSON.parse(doacoesSalvas);
}

export async function salvarDoacao(doacao: Doacao): Promise<void> {
    const doacoesAtuais = await listarDoacoes();
    const novasDoacoes = [...doacoesAtuais, doacao];
    await AsyncStorage.setItem(CHAVE_DOACOES, JSON.stringify(novasDoacoes));
}

export async function excluirDoacao(id: string): Promise<void> {
    const doacoesAtuais = await listarDoacoes();
    const doacoesRestantes = doacoesAtuais.filter((doacao) => doacao.id !== id);
    await AsyncStorage.setItem(CHAVE_DOACOES, JSON.stringify(doacoesRestantes));
}

export async function atualizarDoacao(doacaoAtualizada: Doacao): Promise<void> {
    const doacoesAtuais = await listarDoacoes();
    const doacoesAtualizadas = doacoesAtuais.map((doacao) =>
        doacao.id === doacaoAtualizada.id ? doacaoAtualizada : doacao
    );
    await AsyncStorage.setItem(CHAVE_DOACOES, JSON.stringify(doacoesAtualizadas));
}