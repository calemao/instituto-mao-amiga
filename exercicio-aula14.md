# Exercício da Aula 14 (Bloco 4): Revisão em Pares do Layout Responsivo

Preenchido durante o Bloco 4 de hoje, depois de testar o projeto de um colega. Entregue junto com a Issue #06, no mesmo prazo.

## O que fazer

1. Troquem de estação com um colega, ou clonem o repositório do projeto dele.
2. Rodem o app do colega numa condição que o próprio autor ainda não tinha testado: outra resolução, outra orientação (paisagem, se ele só tinha testado retrato) ou outro aparelho/emulador.
3. Apliquem as mesmas três perguntas da auditoria de hoje, na tela ou telas que fizer sentido testar nessa condição nova:
   1. Existe algum valor de tamanho fixo em pixels que deveria ser relativo, ou usar `aspectRatio`?
   2. Existe algum elemento tocável abaixo de 44x44 pixels CSS?
   3. Existe algum campo de formulário que o teclado pode cobrir, sem `KeyboardAvoidingView` protegendo a tela?
4. Preencham este documento e devolvam para o colega corrigir o que for encontrado, antes do fechamento da aula.
5. Entreguem este mesmo documento (preenchido por vocês, sobre o projeto do colega) junto com a própria Issue #06.

## Identificação

**Meu nome (avaliador):** Christian Amsberg Janner
**Nome do colega avaliado:** Lucca Lopes Araújo
**Repositório do colega (link do GitHub):** https://github.com/Valadares24/Instituto_Mao_Amiga
**Condição testada** (resolução/orientação/aparelho diferente do que o autor já tinha testado): Samsung Galaxy S23 (Android), orientação paisagem

## Avaliação

Para cada uma das três perguntas, marquem uma das duas opções. Se não encontraram problema, não deixem em branco: apontem o que está implementado e por que funciona naquela condição, isso também é parte da avaliação.

**1. Tamanho fixo em pixels / `aspectRatio`**
- [ ] Problema encontrado. Onde, e o que quebrou:
- [x] Nenhum problema. O que está implementado e por que segura nessa condição: Os elementos usam dimensões relativas (`width: '100%'`, `padding`, `marginBottom`), sem imagens na tela testada. No Samsung S23 em paisagem, a lista de pontos e o formulário se ajustaram normalmente à largura da tela, sem cortar texto.

**2. Alvo de toque (mínimo 44x44 pixels CSS)**
- [ ] Problema encontrado. Onde, e o que quebrou:
- [x] Nenhum problema. O que está implementado e por que segura nessa condição: Os campos do formulário, o botão "Registrar doação" e os itens da lista têm `minHeight: 44` aplicado explicitamente no estilo, garantindo a área mínima de toque independente do tamanho da tela ou densidade de pixels do aparelho.

**3. Campo de formulário coberto pelo teclado**
- [x] Problema encontrado. Onde, e o que quebrou: No Samsung S23, em orientação paisagem, ao tocar em qualquer um dos três campos do formulário de cadastro de doação, o teclado do Android (Gboard) entrava em modo de tela cheia (fullscreen IME), comum em telas baixas como paisagem. Nesse modo, o texto digitado aparecia numa barra de prévia no topo, mas com baixo contraste (texto escuro sobre fundo escuro), dificultando bastante a leitura do que estava sendo digitado.
  **Correção aplicada:** adicionada a prop `disableFullscreenUI` aos três `TextInput` do formulário, impedindo o Android de entrar nesse modo de tela cheia. Depois da correção, o teclado normal aparece e o texto digitado fica visível com contraste adequado dentro do próprio campo.
- [ ] Nenhum problema. O que está implementado e por que segura nessa condição:

## Devolutiva

- [x] Confirmo que devolvi este apontamento ao colega, antes do fechamento da aula, para que ele corrigisse o que foi encontrado.
