package br.com.maoamiga.api.dto;

import br.com.maoamiga.api.entity.Ponto;

import java.util.UUID;

// Dados que a API devolve para o app. O controller nunca devolve a entidade.
public record PontoResponseDTO(
        UUID id,
        String nome,
        String endereco,
        String bairro,
        String horario,
        String tipo
) {
    public static PontoResponseDTO from(Ponto ponto) {
        return new PontoResponseDTO(
                ponto.getId(),
                ponto.getNome(),
                ponto.getEndereco(),
                ponto.getBairro(),
                ponto.getHorario(),
                ponto.getTipo()
        );
    }
}
