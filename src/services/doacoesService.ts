import { del, get, post, put } from './api';
import type { Pagina } from './pontosService';

export type Doacao = {
    id: string;
    tipoItem: string;
    quantidade: number;
    pontoDestino: string;
    criadoEm: string;
};

export type DoacaoInput = Omit<Doacao, 'id' | 'criadoEm'>;

const TAMANHO_PADRAO = 10;

// Sobe a cada cadastro, edição ou exclusão. As telas comparam esse número para saber
// se a lista que mostram ficou velha e precisa ser buscada de novo.
let versao = 0;

export function versaoDasDoacoes(): number {
    return versao;
}

// A API devolve da doação mais nova para a mais antiga; filtro vazio devolve todas.
export function buscarPagina(
    filtro: string,
    pagina: number,
    tamanho: number = TAMANHO_PADRAO
): Promise<Pagina<Doacao>> {
    const f = encodeURIComponent(filtro);
    return get<Pagina<Doacao>>(`/doacoes/filtro?filtro=${f}&page=${pagina}&size=${tamanho}`);
}

export function buscarPorId(id: string): Promise<Doacao> {
    return get<Doacao>(`/doacoes/${encodeURIComponent(id)}`);
}

export async function cadastrar(dados: DoacaoInput): Promise<Doacao> {
    const criada = await post<Doacao>('/doacoes', dados);
    versao++;
    return criada;
}

export async function editar(id: string, dados: DoacaoInput): Promise<Doacao> {
    const editada = await put<Doacao>(`/doacoes/${encodeURIComponent(id)}`, dados);
    versao++;
    return editada;
}

export async function excluir(id: string): Promise<void> {
    await del(`/doacoes/${encodeURIComponent(id)}`);
    versao++;
}

// A API manda a data sem fuso (ex.: 2026-11-16T16:26:29.787669). Lê-se direto do texto,
// sem passar por Date, para não depender de como o aparelho interpreta os microssegundos.
export function formatarDataDoacao(criadoEm: string): string {
    const m = criadoEm.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    if (!m) return criadoEm;
    return `${m[3]}/${m[2]}/${m[1]} às ${m[4]}:${m[5]}`;
}
