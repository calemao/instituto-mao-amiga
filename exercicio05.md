# Exercício Prático — Aula 05

**Nome:** Christian Amsberg Janner    **Data:** 16/08/2026

Crie um pequeno fluxo com 2 telas navegáveis (Stack Navigator), passando pelo menos 1 parâmetro de uma tela para a outra.

**1. Descreva as 2 telas e o que cada uma faz:**

TelaListaProdutos mostra todos os produtos da loja, cada um como um item tocável
(TouchableOpacity), com imagem, nome, preço, estoque, contador de quantidade e
botão de favorito. TelaDetalheProduto mostra os dados completos de um único
produto (imagem, nome, preço), aberta ao tocar num item da lista.

**2. Qual parâmetro é passado da Tela 1 para a Tela 2:**

O `produtoId` (o `id` do produto tocado), passado via
`navigation.navigate('DetalheProduto', { produtoId: produto.id })`.

**3. O que muda na Tela 2 por causa do parâmetro recebido:**

A TelaDetalheProduto lê o `produtoId` de `route.params` e usa `.find()` para
localizar, no array `produtosMock`, o produto correspondente. É esse produto
encontrado que é passado como prop para o componente `DetalheProduto`, que
desenha a tela — por isso cada toque na lista abre um produto diferente.

**4. Cole aqui o código de navegação (o `navigate` e a leitura do `route.params`):**

```
tsx
// Em TelaListaProdutos.tsx (dentro de ProdutoItem)
onPress={() => navigation.navigate('DetalheProduto', { produtoId: produto.id })}

// Em TelaDetalheProduto.tsx
export default function TelaDetalheProduto({ route }: { route: any }) {
  const { produtoId } = route.params;
  const produto = produtosMock.find((p) => p.id === produtoId);
  ...
}

```
