# API do Instituto Mão Amiga

API REST em Spring Boot que gerencia os **pontos de coleta e distribuição** do Instituto Mão Amiga.
Ela fica nesta pasta (`api/`), dentro do repositório do aplicativo.

## Tecnologias

- Java **21**
- Spring Boot 4.1.1 (Spring Web, Spring Data JPA, Bean Validation)
- Banco **H2 gravando em arquivo** (`api/data/maoamiga`), que continua depois de reiniciar a API
- Lombok
- Swagger (springdoc-openapi 3.1.0)

## Como executar

Na pasta `api/`:

```powershell
.\mvnw spring-boot:run
```

Ou, no IntelliJ IDEA, abra a pasta `api/` como projeto Maven e execute a classe `MaoAmigaApiApplication`.

A API sobe em `http://localhost:8080`. A carga inicial cria os pontos de Goiânia na primeira execução e **não duplica** nas seguintes.
Se o IntelliJ marcar erros no Lombok, ative *Settings > Build > Compiler > Annotation Processors > Enable annotation processing*.

Swagger (documentação e testes dos endpoints): <http://localhost:8080/swagger-ui/index.html>

## Pontos

Campos de um ponto:

| Campo | Tipo | Observação |
|---|---|---|
| `id` | UUID | gerado pela API |
| `nome` | texto | obrigatório, até 100 caracteres |
| `endereco` | texto | obrigatório, até 200 caracteres |
| `bairro` | texto | obrigatório, até 100 caracteres |
| `horario` | texto | obrigatório, até 100 caracteres (ex.: "Seg a Sex, 8h às 17h") |
| `tipo` | texto | obrigatório: `coleta` ou `distribuição` |

### Endpoints

| Método | URL | O que faz | Respostas |
|---|---|---|---|
| GET | `http://localhost:8080/api/v1/pontos` | Lista todos os pontos | 200 |
| GET | `http://localhost:8080/api/v1/pontos/{id}` | Busca um ponto pelo id | 200, 404 |
| POST | `http://localhost:8080/api/v1/pontos` | Cadastra um ponto | 201, 400 |
| PUT | `http://localhost:8080/api/v1/pontos/{id}` | Edita um ponto | 200, 400, 404 |
| DELETE | `http://localhost:8080/api/v1/pontos/{id}` | Exclui um ponto | 204, 404 |

Corpo de exemplo para `POST` e `PUT`:

```json
{
  "nome": "Ponto de Coleta Setor Oeste",
  "endereco": "Rua 5, nº 100, Setor Oeste, Goiânia-GO",
  "bairro": "Setor Oeste",
  "horario": "Segunda a sexta, das 8h às 17h",
  "tipo": "coleta"
}
```

### Erros

Todas as respostas de erro têm o mesmo formato:

- **400** — campo obrigatório vazio ou inválido (nada é gravado). Traz a mensagem de cada campo em `campos`.
  ```json
  { "status": 400, "mensagem": "Verifique os campos informados.", "campos": { "nome": "O nome é obrigatório." } }
  ```
- **404** — id inexistente em `GET`, `PUT` ou `DELETE`.
  ```json
  { "status": 404, "mensagem": "Ponto não encontrado." }
  ```
