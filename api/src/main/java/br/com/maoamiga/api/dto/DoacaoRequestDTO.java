package br.com.maoamiga.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

// Dados que o app envia para cadastrar ou editar uma doação. A data de cadastro não vem do app.
public record DoacaoRequestDTO(

        @NotBlank(message = "O tipo do item é obrigatório.")
        @Size(max = 100, message = "O tipo do item deve ter no máximo 100 caracteres.")
        String tipoItem,

        @NotNull(message = "A quantidade é obrigatória.")
        @Positive(message = "A quantidade deve ser maior que zero.")
        Integer quantidade,

        @NotBlank(message = "O ponto de destino é obrigatório.")
        @Size(max = 100, message = "O ponto de destino deve ter no máximo 100 caracteres.")
        String pontoDestino
) {
}
