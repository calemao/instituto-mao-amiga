// Único arquivo do app que chama fetch. A URL do servidor fica aqui, num lugar só.
// No celular, troque pelo IP do computador na rede local (ipconfig -> "Endereço IPv4").
// Não use localhost: no celular, localhost é o próprio aparelho.
export const API_URL = 'http://10.144.29.97:8080';

const BASE = `${API_URL}/api/v1`;
const TEMPO_LIMITE_MS = 8000;

export type Campos = Record<string, string>;

export class ApiError extends Error {
    status: number;
    campos?: Campos;

    constructor(status: number, mensagem: string, campos?: Campos) {
        super(mensagem);
        this.name = 'ApiError';
        this.status = status;
        this.campos = campos;
    }
}

// Status 0 = não chegou resposta (API desligada, IP errado ou tempo esgotado).
export function statusDoErro(erro: unknown): number | null {
    const status = (erro as { status?: unknown } | null)?.status;
    return typeof status === 'number' ? status : null;
}

export function mensagemDoErro(erro: unknown): string {
    const mensagem = (erro as { message?: unknown } | null)?.message;
    if (statusDoErro(erro) !== null && typeof mensagem === 'string') {
        return mensagem;
    }
    return 'Ocorreu um erro inesperado. Tente novamente.';
}

export function camposDoErro(erro: unknown): Campos | undefined {
    return (erro as { campos?: Campos } | null)?.campos;
}

async function requisitar<T>(metodo: string, caminho: string, corpo?: unknown): Promise<T> {
    const controle = new AbortController();
    const temporizador = setTimeout(() => controle.abort(), TEMPO_LIMITE_MS);

    let resposta: Response;
    try {
        resposta = await fetch(`${BASE}${caminho}`, {
            method: metodo,
            headers:
                corpo !== undefined
                    ? { 'Content-Type': 'application/json', Accept: 'application/json' }
                    : { Accept: 'application/json' },
            body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
            signal: controle.signal,
        });
    } catch {
        throw new ApiError(
            0,
            'Não foi possível conectar à API. Verifique se ela está ligada e tente novamente.'
        );
    } finally {
        clearTimeout(temporizador);
    }

    if (!resposta.ok) {
        let mensagem = `Erro ${resposta.status} ao falar com a API.`;
        let campos: Campos | undefined;
        try {
            const dados = await resposta.json();
            if (typeof dados?.mensagem === 'string') mensagem = dados.mensagem;
            if (dados?.campos && typeof dados.campos === 'object') campos = dados.campos;
        } catch {
            // resposta de erro sem corpo JSON: fica a mensagem padrão
        }
        throw new ApiError(resposta.status, mensagem, campos);
    }

    if (resposta.status === 204) {
        return undefined as T;
    }
    return (await resposta.json()) as T;
}

export function get<T>(caminho: string): Promise<T> {
    return requisitar<T>('GET', caminho);
}

export function post<T>(caminho: string, corpo: unknown): Promise<T> {
    return requisitar<T>('POST', caminho, corpo);
}

export function put<T>(caminho: string, corpo: unknown): Promise<T> {
    return requisitar<T>('PUT', caminho, corpo);
}

export function del(caminho: string): Promise<void> {
    return requisitar<void>('DELETE', caminho);
}
