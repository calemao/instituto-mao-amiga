package br.com.maoamiga.api.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);

    // Campo obrigatório vazio ou inválido (Bean Validation) -> 400 com a mensagem de cada campo.
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErroResponse> dadosInvalidos(MethodArgumentNotValidException e) {
        Map<String, String> campos = new LinkedHashMap<>();
        for (FieldError erro : e.getBindingResult().getFieldErrors()) {
            campos.putIfAbsent(erro.getField(), erro.getDefaultMessage());
        }
        return resposta(HttpStatus.BAD_REQUEST, "Verifique os campos informados.", campos);
    }

    // JSON malformado ou com tipo errado -> 400.
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErroResponse> corpoIlegivel(HttpMessageNotReadableException e) {
        return resposta(HttpStatus.BAD_REQUEST, "Os dados enviados estão em um formato inválido.", null);
    }

    // Id que não é um UUID (ex.: /pontos/abc) -> 400.
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErroResponse> parametroInvalido(MethodArgumentTypeMismatchException e) {
        return resposta(HttpStatus.BAD_REQUEST, "O valor informado para '" + e.getName() + "' é inválido.", null);
    }

    // Ponto não encontrado e outros erros lançados de propósito (404 etc.).
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErroResponse> statusExplicito(ResponseStatusException e) {
        HttpStatus status = HttpStatus.resolve(e.getStatusCode().value());
        String mensagem = e.getReason() != null ? e.getReason() : "Não foi possível concluir a operação.";
        return resposta(status != null ? status : HttpStatus.INTERNAL_SERVER_ERROR, mensagem, null);
    }

    // Qualquer outra exceção: erros do próprio Spring (rota inexistente, método não permitido) mantêm
    // o status deles; o que não é previsto vira 500 sem expor detalhes técnicos.
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErroResponse> inesperado(Exception e) {
        if (e instanceof ErrorResponse springErro) {
            int codigo = springErro.getStatusCode().value();
            HttpStatus status = HttpStatus.resolve(codigo) != null ? HttpStatus.resolve(codigo) : HttpStatus.BAD_REQUEST;
            String mensagem = codigo == 404 ? "Recurso não encontrado." : "Requisição inválida.";
            return resposta(status, mensagem, null);
        }
        log.error("Erro inesperado", e);
        return resposta(HttpStatus.INTERNAL_SERVER_ERROR, "Erro interno do servidor. Tente novamente mais tarde.", null);
    }

    private ResponseEntity<ErroResponse> resposta(HttpStatus status, String mensagem, Map<String, String> campos) {
        return ResponseEntity.status(status).body(new ErroResponse(status.value(), mensagem, campos));
    }
}
