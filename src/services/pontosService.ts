import { del, get, post, put } from './api';

export type TipoPonto = 'coleta' | 'distribuição';

export type Ponto = {
    id: string;
    nome: string;
    endereco: string;
    bairro: string;
    horario: string;
    tipo: TipoPonto;
};

export type PontoInput = Omit<Ponto, 'id'>;

export type Pagina<T> = {
    content: T[];
    page: { size: number; number: number; totalElements: number; totalPages: number };
};

const TAMANHO_PADRAO = 10;

// Sobe a cada cadastro, edição ou exclusão. As telas comparam esse número para saber
// se a lista que mostram ficou velha e precisa ser buscada de novo.
let versao = 0;

export function versaoDosPontos(): number {
    return versao;
}

export function listar(): Promise<Ponto[]> {
    return get<Ponto[]>('/pontos');
}

export function buscarPagina(
    filtro: string,
    pagina: number,
    tamanho: number = TAMANHO_PADRAO
): Promise<Pagina<Ponto>> {
    const f = encodeURIComponent(filtro);
    return get<Pagina<Ponto>>(`/pontos/filtro?filtro=${f}&page=${pagina}&size=${tamanho}`);
}

export function buscarPorId(id: string): Promise<Ponto> {
    return get<Ponto>(`/pontos/${encodeURIComponent(id)}`);
}

export async function cadastrar(dados: PontoInput): Promise<Ponto> {
    const criado = await post<Ponto>('/pontos', dados);
    versao++;
    return criado;
}

export async function editar(id: string, dados: PontoInput): Promise<Ponto> {
    const editado = await put<Ponto>(`/pontos/${encodeURIComponent(id)}`, dados);
    versao++;
    return editado;
}

export async function excluir(id: string): Promise<void> {
    await del(`/pontos/${encodeURIComponent(id)}`);
    versao++;
}
