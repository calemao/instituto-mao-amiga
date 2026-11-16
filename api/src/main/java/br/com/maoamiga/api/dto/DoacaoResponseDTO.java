package br.com.maoamiga.api.dto;

import br.com.maoamiga.api.entity.Doacao;

import java.time.LocalDateTime;
import java.util.UUID;

// Dados que a API devolve para o app. O controller nunca devolve a entidade.
public record DoacaoResponseDTO(
        UUID id,
        String tipoItem,
        Integer quantidade,
        String pontoDestino,
        LocalDateTime criadoEm
) {
    public static DoacaoResponseDTO from(Doacao doacao) {
        return new DoacaoResponseDTO(
                doacao.getId(),
                doacao.getTipoItem(),
                doacao.getQuantidade(),
                doacao.getPontoDestino(),
                doacao.getCriadoEm()
        );
    }
}
