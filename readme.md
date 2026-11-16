# Instituto Mão Amiga

Aplicativo móvel (React Native + Expo) e API (Spring Boot) para consultar os **pontos de coleta e distribuição** do Instituto Mão Amiga e registrar **doações**.

- **Pontos e doações** ficam na API, com banco de dados. O app só mostra e envia os dados.
- **Favoritos** ficam no próprio aparelho (só os ids dos pontos).

Projeto N2 individual da disciplina de React Native. Autor: Christian Amsberg Janner (GitHub: `calemao`).

## Guia rápido para o professor

São dois programas que precisam estar ligados ao mesmo tempo: **a API** (no computador) e **o app** (no celular, pelo Expo Go).

1. Instale o que está em [Requisitos](#requisitos).
2. Ligue a API: `cd api` e `.\mvnw spring-boot:run` ([detalhes](#1-ligar-a-api)).
3. Descubra o IP do computador (`ipconfig`) e coloque em **`src/services/api.ts`, linha 4** ([detalhes](#3-apontar-o-app-para-a-api-o-passo-que-mais-falha)).
4. Rode o app: `npm install` e `npx expo start`, e leia o QR code com o Expo Go ([detalhes](#4-ligar-o-app)).
5. Siga o [roteiro de avaliação](#como-avaliar) (cerca de 10 minutos).

> **Importante:** o IP que está gravado em `src/services/api.ts` é o do computador do autor e **não vai funcionar na sua máquina**. Sem trocá-lo, o app mostra *"Não foi possível conectar à API"*. A API em si pode ser avaliada sozinha, só pelo Swagger, sem o app e sem o IP ([seção da API](#avaliando-só-a-api-sem-o-app)).

## Requisitos

| O quê | Versão | Para quê |
|---|---|---|
| **JDK (Java)** | **21** | Rodar a API. O Maven não precisa estar instalado: o projeto traz o `mvnw`. |
| **Node.js** | **22.13 ou superior** (22 ou 24 LTS) | Rodar o app. Versões mais antigas não funcionam com Expo SDK 58. |
| **Expo Go** | versão que suporta o **SDK 58** (a atual das lojas) | Abrir o app no celular. |
| **Rede** | computador e celular no **mesmo Wi-Fi** | O celular precisa alcançar a API. |
| Internet | na primeira vez | O `mvnw` baixa o Maven e as dependências; o `npm install` baixa os pacotes. |

Para conferir: `java -version` (deve mostrar 21) e `node -v` (deve mostrar 22.13 ou superior).

## Passo a passo

### 1. Ligar a API

Em um terminal (PowerShell), na pasta do projeto:

```powershell
cd api
.\mvnw spring-boot:run
```

Deixe esse terminal aberto. A API está pronta quando aparecer algo como `Started MaoAmigaApiApplication`.

- Endereço: `http://localhost:8080`
- **Swagger** (documentação e testes): <http://localhost:8080/swagger-ui/index.html>
- Na primeira execução a API cria **25 pontos de Goiânia** (dados de demonstração). Não cria nenhuma doação: elas são registradas pelo app ou pelo Swagger.
- Só **uma API por vez** pode usar a porta 8080. Se outro projeto estiver nela, pare-o antes.
- Alternativa: abrir a pasta `api/` no IntelliJ IDEA como projeto Maven e executar a classe `MaoAmigaApiApplication`. Se o IntelliJ marcar erro no Lombok, ative *Settings > Build > Compiler > Annotation Processors > Enable annotation processing*.

### 2. Conferir que a API responde

No navegador do **computador**, abra <http://localhost:8080/api/v1/pontos>. Deve aparecer uma lista JSON com 25 pontos.

### 3. Apontar o app para a API (o passo que mais falha)

O celular não enxerga `localhost` (para ele, isso é o próprio aparelho). O app precisa do **IP do computador na rede local**, e ele está em **um único lugar**:

**`src/services/api.ts`, linha 4:**

```ts
export const API_URL = 'http://192.168.1.120:8080'; // exemplo: troque pelo IP do seu computador
```

Como descobrir o IP:

1. Abra o PowerShell e rode `ipconfig`.
2. Procure o adaptador **Wi-Fi** e copie o **Endereço IPv4** (algo como `192.168.0.15` ou `10.0.0.23`).
3. Troque o número na linha 4, mantendo `http://` e `:8080`. Exemplo: `'http://192.168.0.15:8080'`.
4. Salve o arquivo. Se o app já estiver aberto, recarregue no Expo Go.

**Teste antes de abrir o app:** no navegador do **celular**, abra `http://SEU-IP:8080/api/v1/pontos`. Se aparecer o JSON, o app também vai conectar. Se não abrir, veja [Problemas comuns](#problemas-comuns).

### 4. Ligar o app

Em **outro** terminal, na pasta raiz do projeto (onde está o `package.json`):

```powershell
npm install
npx expo start
```

Abra o **Expo Go** no celular e leia o **QR code** que aparece no terminal (no Android, use "Scan QR code" dentro do Expo Go; no iPhone, a câmera comum). O app abre na lista de pontos.

### Sem celular: emulador

Também funciona no emulador, só mudando o endereço na linha 4 de `src/services/api.ts`:

| Onde roda o app | Endereço a usar |
|---|---|
| Emulador **Android** (Android Studio) | `http://10.0.2.2:8080` |
| Simulador **iOS** (só em Mac) | `http://localhost:8080` |

Depois de `npx expo start`, pressione `a` (Android) ou `i` (iOS) no terminal. O emulador precisa ter o Expo Go instalado.

### Problemas comuns

**"Não foi possível conectar à API" no app**

1. A API está ligada e é a única na porta 8080?
2. O IP na linha 4 de `src/services/api.ts` é o **atual** do computador? (Ele muda quando se troca de rede.)
3. O celular está no mesmo Wi-Fi do computador?
4. O teste no navegador do celular (`http://SEU-IP:8080/api/v1/pontos`) abre? Se **não** abrir:
   - O **Firewall do Windows** pode estar bloqueando a porta 8080. Em *Configurações > Rede e Internet > Wi-Fi > propriedades da rede*, deixe o perfil como **Privada**; ou crie uma regra de entrada liberando a porta TCP 8080.
   - Algumas redes (Wi-Fi de instituição, rede de visitantes) **isolam os aparelhos entre si**. Nesse caso, ligue o **roteador do celular** (hotspot), conecte o computador a ele, rode `ipconfig` de novo e troque o IP.

**O QR code não abre o app:** confirme que o Expo Go está atualizado (o projeto usa Expo SDK 58) e que celular e computador estão no mesmo Wi-Fi.

**`mvnw` não é reconhecido:** rode o comando de dentro da pasta `api/`. Em Linux/Mac, use `./mvnw spring-boot:run`.

**Recomeçar do zero:** pare a API, apague a pasta `api/data` e ligue a API de novo. Ela volta com os 25 pontos e sem doações. A pasta `api/data` não vai para o GitHub, então quem baixa o projeto já começa assim.

## Como avaliar

Os números entre parênteses são as issues do GitHub do projeto (N2-1 a N2-8 = #11 a #18).

### Avaliando só a API (sem o app)

Abra o Swagger (<http://localhost:8080/swagger-ui/index.html>), clique em *Try it out* e *Execute* em cada item.

| O que testar | Esperado | Issue |
|---|---|---|
| `GET /api/v1/pontos` | **200**, lista com 25 pontos | N2-1 (#11) |
| `POST /api/v1/pontos` com os campos vazios | **400**, com a mensagem de cada campo em `campos` | N2-1 (#11) |
| `GET /api/v1/pontos/{id}` com `00000000-0000-0000-0000-000000000000` | **404**, "Ponto não encontrado." | N2-1 (#11) |
| `GET /api/v1/pontos/filtro?filtro=bueno&page=0&size=2` | **200**, formato `content` + `page`, só pontos do Setor Bueno | N2-2 (#12) |
| `GET /api/v1/pontos/filtro?sort=abc` | **400**, "Campo de ordenação inválido." | N2-2 (#12) |
| `POST /api/v1/doacoes` com `{"tipoItem":"roupas","quantidade":3,"pontoDestino":"Ponto de Coleta Setor Bueno"}` | **201**, com `id` e `criadoEm` gerados pela API | N2-5 (#15) |
| O mesmo `POST` com `"quantidade": 0` | **400**, "A quantidade deve ser maior que zero." | N2-5 (#15) |
| `PUT /api/v1/doacoes/{id}` com outros valores | **200**; `id` e `criadoEm` continuam iguais | N2-5 (#15) |
| `GET /api/v1/doacoes/filtro?filtro=roupas` | **200**, da doação mais nova para a mais antiga | N2-5 (#15) |
| `DELETE /api/v1/doacoes/{id}` e depois `GET` do mesmo id | **204**, e depois **404** | N2-5 (#15) |

Todos os endpoints, campos, formatos de erro e prints reais do Swagger estão em [`api/README.md`](api/README.md).

### Avaliando o app (celular)

Com a API ligada e o IP certo:

| Passo | Esperado | Issue |
|---|---|---|
| Abrir o app | Lista de pontos vinda da API, com "Carregando..." antes de aparecer | N2-3 (#13) |
| Digitar **bueno** na busca | A lista é filtrada pela API (nome ou bairro) | N2-3 (#13) |
| Rolar a lista até o fim | Mais pontos carregam sozinhos (rolagem infinita) | N2-3 (#13) |
| Tocar em um ponto | Detalhe do ponto, buscado pelo id | N2-3 (#13) |
| **Novo ponto**: enviar vazio | Mensagem de validação, nada é gravado | N2-4 (#14) |
| **Novo ponto**: preencher e salvar | Volta à lista e o ponto aparece | N2-4 (#14) |
| Detalhe do ponto → **Editar ponto** → salvar | O detalhe mostra os valores novos | N2-4 (#14) |
| Detalhe do ponto → **Excluir ponto** → confirmar | O ponto some da lista | N2-4 (#14) |
| **Registrar doação**: enviar vazio, e depois quantidade **0** | Mensagem de validação, nada é gravado | N2-6 (#16) |
| **Registrar doação**: preencher, **escolher um ponto** na lista (fica destacado) e salvar | Volta ao histórico com a doação **no topo** | N2-6 (#16) |
| **Minhas doações**: buscar por **roupas** | Só as doações desse tipo aparecem (busca feita pela API) | N2-6 (#16) |
| **Minhas doações**: rolar até o fim (com mais de 10 doações) | A segunda página carrega sozinha | N2-6 (#16) |
| Abrir uma doação → **Editar doação** → salvar | O formulário vem preenchido; depois de salvar, os dados mudam, mas a data de registro e o id continuam iguais | N2-7 (#17) |
| Abrir uma doação → **Excluir doação** → Cancelar, depois Excluir | Cancelar não faz nada; Excluir volta ao histórico e a doação some | N2-7 (#17) |
| Tocar no **♡** de um ponto (na lista ou no detalhe) | Vira **♥** nos dois lugares | N2-8 (#18) |
| Tocar em **Meus pontos** | Mostra só os pontos favoritos; o ♥ da tela remove o favorito | N2-8 (#18) |
| Fechar o app por completo e abrir de novo | Os favoritos continuam | N2-8 (#18) |
| Favoritar um ponto, excluí-lo pelo Swagger (`DELETE /api/v1/pontos/{id}`) e abrir **Meus pontos** | O ponto excluído não aparece e o app não quebra | N2-8 (#18) |
| **Desligar a API** e abrir qualquer lista | Aviso de erro com o botão **Tentar novamente**; ao religar a API e tocar nele, os dados voltam | N2-3, N2-6, N2-7 |

Como o app começa **sem doações**, registre algumas primeiro. Para testar a rolagem infinita do histórico, registre 11 ou mais (o Swagger é mais rápido para isso).

## Roteiro de demonstração (≈3 minutos)

Para quem quiser ver o fluxo principal de ponta a ponta, sem passar por todos os testes acima.

| Tempo | O que mostrar | O que deve acontecer |
|---|---|---|
| 0:00 | Lista de pontos. Digitar **"bueno"** na busca. | A lista filtra pela API e mostra só os pontos do Setor Bueno. |
| 0:25 | Abrir um ponto e tocar no **♡**. Voltar. | O coração vira ♥ no detalhe e na lista. |
| 0:45 | Tocar em **Meus pontos**. Desfavoritar o ponto no ♥. | O ponto aparece e some da tela; com nenhum favorito, aparece a mensagem de vazio. |
| 1:05 | **Registrar doação**: enviar vazio, depois com quantidade **0**. | O app mostra a mensagem de validação e não grava. |
| 1:25 | Preencher tipo e quantidade, **escolher um ponto** na lista e registrar. | Volta ao histórico com a doação nova **no topo**. |
| 1:50 | Filtrar o histórico por **"roupas"**. Abrir uma doação, **Editar**, salvar. | Só as de roupas aparecem. Os dados mudam; data de registro e id continuam iguais. |
| 2:15 | **Excluir** uma doação: Cancelar, depois Excluir. | Cancelar não faz nada; Excluir volta ao histórico e a doação some. |
| 2:30 | No **Swagger**: `POST /api/v1/doacoes` com `{"tipoItem":"roupas","quantidade":0,"pontoDestino":"X"}`. | **400** com `campos.quantidade`: "A quantidade deve ser maior que zero.". |
| 2:45 | No Swagger: `GET /api/v1/doacoes/{id}` com `00000000-0000-0000-0000-000000000000`. | **404** com a mensagem "Doação não encontrada.". |

## Estrutura do projeto

```
instituto-mao-amiga/
├── api/                      API REST em Spring Boot (Java 21)
│   ├── src/main/java/...     controller, service, repository, entity, dto, exception, config
│   ├── docs/swagger/         prints reais do Swagger usados no README da API
│   └── README.md             endpoints, campos, erros e prints da API
├── src/services/
│   ├── api.ts                único arquivo que chama fetch; guarda a URL da API (linha 4)
│   ├── pontosService.ts      chamadas de pontos
│   ├── doacoesService.ts     chamadas de doações
│   └── favoritosService.ts   favoritos no aparelho (AsyncStorage, só ids)
├── App.tsx                   navegação entre as telas
├── Tela*.tsx, BotaoFavorito.tsx   telas e componente do coração
└── readme.md                 este arquivo
```

**Tecnologias:** Expo SDK 58, React Native 0.88, React Navigation (native stack), TypeScript (modo estrito), AsyncStorage · Spring Boot 4.1.1, Spring Data JPA, Bean Validation, banco H2 em arquivo, springdoc-openapi (Swagger).

## Decisão técnica: favoritos no aparelho, pontos e doações no servidor

Os **pontos** e as **doações** são dados do Instituto: precisam ser iguais para todo mundo e continuar existindo se o app for desinstalado. Por isso ficam na API, com banco de dados.

Os **favoritos** são uma preferência pessoal de quem usa aquele celular. A API não tem login nem usuários, então não existe "de quem" seria o favorito. Criar uma tabela de favoritos no servidor exigiria inventar usuários só para isso, e todo mundo compartilharia a mesma lista. Por isso os favoritos ficam no **AsyncStorage** do aparelho.

Dentro dessa escolha, o app guarda **apenas os ids** dos pontos favoritos, e não uma cópia dos dados. Em **Meus pontos**, cada ponto é buscado na API pelo id. Isso traz duas vantagens:

- **Nunca mostra dado velho:** se um ponto for editado no servidor, o favorito já aparece atualizado.
- **Pontos excluídos somem sozinhos:** se a API responde 404 para um id favorito, esse ponto é simplesmente ignorado, sem erro na tela.

O que se perde: os favoritos **não acompanham** a pessoa se ela trocar de aparelho ou limpar os dados do app. Para um app sem login, é um custo aceitável.
