package br.com.maoamiga.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

// Dados que o app envia para cadastrar ou editar um ponto. Todos os campos são obrigatórios.
public record PontoRequestDTO(

        @NotBlank(message = "O nome é obrigatório.")
        @Size(max = 100, message = "O nome deve ter no máximo 100 caracteres.")
        String nome,

        @NotBlank(message = "O endereço é obrigatório.")
        @Size(max = 200, message = "O endereço deve ter no máximo 200 caracteres.")
        String endereco,

        @NotBlank(message = "O bairro é obrigatório.")
        @Size(max = 100, message = "O bairro deve ter no máximo 100 caracteres.")
        String bairro,

        @NotBlank(message = "O horário é obrigatório.")
        @Size(max = 100, message = "O horário deve ter no máximo 100 caracteres.")
        String horario,

        @NotBlank(message = "O tipo é obrigatório.")
        @Pattern(regexp = "(?i)coleta|distribuição", message = "O tipo deve ser 'coleta' ou 'distribuição'.")
        String tipo
) {
}
