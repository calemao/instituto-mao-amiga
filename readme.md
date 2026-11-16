# Instituto Mão Amiga

Aplicativo (React Native + Expo) e API (Spring Boot) para consultar os **pontos de coleta e distribuição** do Instituto Mão Amiga e registrar **doações**.

- **Pontos e doações** ficam na API: o app só mostra e envia dados.
- **Favoritos** ficam no próprio aparelho (só os ids dos pontos).

```
instituto-mao-amiga/
├── api/        API REST em Spring Boot (pontos e doações) → detalhes em api/README.md
├── src/services/   Acesso à API (api.ts, pontosService.ts, doacoesService.ts) e aos favoritos
├── Tela*.tsx   Telas do app
└── App.tsx     Navegação
```

## O que você precisa

- **Java 21** (JDK) para a API
- **Node.js** (versão LTS) e npm para o app
- **Expo Go** no celular, na versão que roda o Expo SDK 58
- Computador e celular **no mesmo Wi-Fi**

## Como rodar a API

Em um terminal, dentro da pasta `api/`:

```powershell
cd api
.\mvnw spring-boot:run
```

A API sobe em `http://localhost:8080`.

- Na primeira execução ela cria **25 pontos de Goiânia** (dados de demonstração) e não duplica nas seguintes.
- O banco é um arquivo (`api/data/maoamiga`), então os dados continuam depois de reiniciar.
- Swagger (documentação e testes): <http://localhost:8080/swagger-ui/index.html>
- Só **uma API por vez** pode usar a porta 8080. Se outro projeto estiver rodando nela, pare-o antes.

Lista completa de endpoints, campos, erros 400/404 e prints do Swagger: [`api/README.md`](api/README.md).

## Como rodar o app

Na pasta do projeto (a raiz, onde está este arquivo):

```powershell
npm install
npx expo start
```

Abra o **Expo Go** no celular e leia o QR code que aparece no terminal.

### Onde trocar o IP da API

O celular não enxerga `localhost` (para ele, isso é o próprio aparelho). O app precisa do **IP do computador na rede local**, e ele está em **um único lugar**:

**`src/services/api.ts`, linha 4:**

```ts
export const API_URL = 'http://192.168.1.120:8080'; // exemplo: troque pelo IP do seu computador
```

Para descobrir o IP, rode `ipconfig` no PowerShell e use o **Endereço IPv4** do adaptador Wi-Fi. Esse número **muda quando você troca de rede**, então confira sempre antes de demonstrar. Depois de trocar, salve o arquivo e recarregue o app no Expo Go.

Se o app mostrar *"Não foi possível conectar à API"*:

1. A API está ligada e é a única na porta 8080?
2. O IP em `api.ts` é o atual do computador?
3. O celular está no mesmo Wi-Fi? Teste abrir `http://IP-DO-PC:8080/api/v1/pontos` no navegador do celular: deve aparecer um JSON.
4. Se o navegador não abrir, o Firewall do Windows pode estar bloqueando a porta 8080. Libere a porta (ou deixe a rede como "Privada").

## O que o app faz

- **Pontos:** lista com busca por nome ou bairro (feita pela API), rolagem infinita, detalhe, cadastro, edição e exclusão.
- **Doações:** registrar (o destino é escolhido entre os pontos da API), histórico com busca por tipo do item e rolagem infinita, detalhe, edição e exclusão com confirmação.
- **Favoritos:** o coração ♡/♥ marca um ponto como favorito; a tela **Meus pontos** lista só os favoritos.
- Todas as telas têm estados de **carregando**, **erro** (com "Tentar novamente") e **vazio**, cada um com a sua mensagem.

## Roteiro de demonstração (≈3 minutos)

Antes de começar: API ligada, app aberto na lista de pontos, algumas doações já cadastradas, Swagger aberto em outra aba do navegador.

| Tempo | O que mostrar | O que deve acontecer |
|---|---|---|
| 0:00 | Lista de pontos. Digitar **"bueno"** na busca. | A lista filtra pela API e mostra só os pontos do Setor Bueno. |
| 0:25 | Abrir um ponto e tocar no **♡**. Voltar. | O coração vira ♥ no detalhe e na lista. |
| 0:45 | Tocar em **Meus pontos**. Desfavoritar o ponto no ♥. | O ponto aparece e some da tela; com nenhum favorito, aparece a mensagem de vazio. |
| 1:05 | **Registrar doação** → enviar vazio, depois com quantidade **0**. | O app mostra a mensagem de validação e não grava. |
| 1:25 | Preencher tipo e quantidade, **escolher um ponto** na lista (fica destacado) e registrar. | Volta ao histórico com a doação nova **no topo**. |
| 1:50 | Filtrar o histórico por **"roupas"**. Abrir uma doação → **Editar** → salvar. | Só as de roupas aparecem. Os dados mudam; a data de registro e o id continuam iguais. |
| 2:15 | **Excluir** uma doação → Cancelar, depois Excluir. | Cancelar não faz nada; Excluir volta ao histórico e a doação some. |
| 2:30 | No **Swagger**: `POST /api/v1/doacoes` com `{"tipoItem":"roupas","quantidade":0,"pontoDestino":"X"}`. | **400** com `campos.quantidade`: "A quantidade deve ser maior que zero.". |
| 2:45 | No Swagger: `GET /api/v1/doacoes/{id}` com `00000000-0000-0000-0000-000000000000`. | **404** com a mensagem "Doação não encontrada.". |

Extra, se sobrar tempo: favorite um ponto, exclua esse ponto pelo Swagger (`DELETE /api/v1/pontos/{id}`) e abra **Meus pontos**. O ponto excluído não aparece mais, e o app não quebra.

## Decisão técnica: favoritos no aparelho, pontos e doações no servidor

Os **pontos** e as **doações** são dados do Instituto: precisam ser iguais para todo mundo e continuar existindo se o app for desinstalado. Por isso ficam na API, com banco de dados.

Os **favoritos** são uma preferência pessoal de quem usa aquele celular. A API não tem login nem usuários, então não existe "de quem" seria o favorito. Criar uma tabela de favoritos no servidor exigiria inventar usuários só para isso, e todo mundo compartilharia a mesma lista. Por isso os favoritos ficam no **AsyncStorage** do aparelho.

Dentro dessa escolha, o app guarda **apenas os ids** dos pontos favoritos, e não uma cópia dos dados. Em **Meus pontos**, cada ponto é buscado na API pelo id. Isso traz duas vantagens:

- **Nunca mostra dado velho:** se um ponto for editado no servidor, o favorito já aparece atualizado.
- **Pontos excluídos somem sozinhos:** se a API responde 404 para um id favorito, esse ponto é simplesmente ignorado, sem erro na tela.

O que se perde: os favoritos **não acompanham** a pessoa se ela trocar de aparelho ou limpar os dados do app. Para um app sem login, é um custo aceitável.
