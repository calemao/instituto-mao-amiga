# Instituto Mão Amiga

App para gerenciar pontos de coleta/distribuição e doações do Instituto Mão Amiga.

## Roteiro de demonstração (≈3 minutos)

1. **Registrar uma doação** — na tela inicial, preencher tipo do item, quantidade e ponto de destino, tocar em "Registrar doação".
2. **Ver o histórico** — tocar em "Ver minhas doações"; mostrar a lista e o resumo de totais por tipo no topo.
3. **Filtrar** — digitar um tipo no campo de busca (ex.: "roupa"); mostrar que a lista filtra em tempo real, sem diferenciar maiúsculas/minúsculas.
4. **Abrir uma doação** — tocar num item do histórico para ver o detalhe completo.
5. **Editar** — tocar em "Editar doação", alterar um valor, salvar; mostrar que o detalhe e o histórico refletem a mudança.
6. **Excluir** — abrir outra doação, tocar em "Excluir doação", confirmar no alerta; mostrar que ela some da lista.
7. **Fechar e reabrir o app** — fechar completamente e abrir de novo, mostrando que o histórico e o resumo continuam com os dados salvos.

## Decisão técnica: por que o acesso ao armazenamento está centralizado

Todas as operações de persistência (`listarDoacoes`, `salvarDoacao`, `atualizarDoacao`, `excluirDoacao`) ficam em um único arquivo, `doacoesStorage.ts`. As telas nunca chamam o `AsyncStorage` diretamente — elas chamam essas funções. Isso evita que cada tela tenha sua própria lógica de leitura/escrita (o que geraria duplicação e risco de inconsistência), e torna mais fácil trocar a forma de armazenamento no futuro sem precisar alterar as telas.

## Decisão técnica: por que os totais do resumo não são salvos

O resumo por tipo (quantidade total, número de doações) é **calculado** a partir do array de doações a cada vez que a tela de histórico é exibida, e não gravado separadamente no AsyncStorage. Se fosse salvo à parte, haveria risco de ficar desatualizado em relação ao array real (por exemplo, depois de uma edição ou exclusão, seria preciso lembrar de atualizar os totais também). Calculando na hora, o resumo está sempre consistente com os dados reais, sem lógica duplicada.
