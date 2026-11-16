package br.com.maoamiga.api.controller;

import br.com.maoamiga.api.dto.DoacaoRequestDTO;
import br.com.maoamiga.api.dto.DoacaoResponseDTO;
import br.com.maoamiga.api.service.DoacaoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/doacoes")
@CrossOrigin("*")
@RequiredArgsConstructor
@Tag(name = "Doações", description = "CRUD de doações com histórico paginado")
public class DoacaoController {

    private final DoacaoService service;

    @GetMapping("/filtro")
    @Operation(summary = "Busca doações pelo tipo do item, com paginação",
            description = "Sem filtro devolve todas as doações. Padrão: 10 por página, da mais nova para a mais antiga.")
    @ApiResponse(responseCode = "200", description = "Página de doações (content + page)")
    @ApiResponse(responseCode = "400", description = "Campo de ordenação inválido")
    public Page<DoacaoResponseDTO> buscarPorFiltro(
            @RequestParam(name = "filtro", defaultValue = "") String filtro,
            @ParameterObject @PageableDefault(size = 10, sort = "criadoEm", direction = Sort.Direction.DESC) Pageable pageable) {
        return service.buscarPorFiltro(filtro, pageable);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca uma doação pelo id")
    @ApiResponse(responseCode = "200", description = "Doação encontrada")
    @ApiResponse(responseCode = "404", description = "Doação não encontrada")
    public DoacaoResponseDTO buscarPorId(@PathVariable("id") UUID id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Cadastra uma doação")
    @ApiResponse(responseCode = "201", description = "Doação cadastrada")
    @ApiResponse(responseCode = "400", description = "Campo obrigatório vazio, quantidade zero ou negativa")
    public DoacaoResponseDTO cadastrar(@Valid @RequestBody DoacaoRequestDTO dto) {
        return service.cadastrar(dto);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Edita uma doação", description = "A data de cadastro e o id não mudam.")
    @ApiResponse(responseCode = "200", description = "Doação editada")
    @ApiResponse(responseCode = "400", description = "Campo obrigatório vazio, quantidade zero ou negativa")
    @ApiResponse(responseCode = "404", description = "Doação não encontrada")
    public DoacaoResponseDTO editar(@PathVariable("id") UUID id, @Valid @RequestBody DoacaoRequestDTO dto) {
        return service.editar(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Exclui uma doação")
    @ApiResponse(responseCode = "204", description = "Doação excluída")
    @ApiResponse(responseCode = "404", description = "Doação não encontrada")
    public void excluir(@PathVariable("id") UUID id) {
        service.excluir(id);
    }
}
