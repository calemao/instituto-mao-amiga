package br.com.maoamiga.api.controller;

import br.com.maoamiga.api.dto.PontoRequestDTO;
import br.com.maoamiga.api.dto.PontoResponseDTO;
import br.com.maoamiga.api.service.PontoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springdoc.core.annotations.ParameterObject;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/pontos")
@CrossOrigin("*")
@RequiredArgsConstructor
@Tag(name = "Pontos de coleta", description = "CRUD de pontos de coleta e distribuição")
public class PontoController {

    private final PontoService service;

    @GetMapping
    @Operation(summary = "Lista todos os pontos")
    @ApiResponse(responseCode = "200", description = "Lista de pontos")
    public List<PontoResponseDTO> listar() {
        return service.listar();
    }

    @GetMapping("/filtro")
    @Operation(summary = "Busca pontos por nome ou bairro, com paginação",
            description = "Sem filtro devolve todos os pontos. Padrão: 10 por página, ordenados por nome. "
                    + "Para mudar a ordem use sort, por exemplo sort=bairro,asc.")
    @ApiResponse(responseCode = "200", description = "Página de pontos (content + page)")
    @ApiResponse(responseCode = "400", description = "Campo de ordenação inválido")
    public Page<PontoResponseDTO> buscarPorFiltro(
            @RequestParam(name = "filtro", defaultValue = "") String filtro,
            @ParameterObject @PageableDefault(size = 10, sort = "nome") Pageable pageable) {
        return service.buscarPorFiltro(filtro, pageable);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca um ponto pelo id")
    @ApiResponse(responseCode = "200", description = "Ponto encontrado")
    @ApiResponse(responseCode = "404", description = "Ponto não encontrado")
    public PontoResponseDTO buscarPorId(@PathVariable("id") UUID id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Cadastra um ponto")
    @ApiResponse(responseCode = "201", description = "Ponto cadastrado")
    @ApiResponse(responseCode = "400", description = "Campo obrigatório vazio ou inválido")
    public PontoResponseDTO cadastrar(@Valid @RequestBody PontoRequestDTO dto) {
        return service.cadastrar(dto);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Edita um ponto")
    @ApiResponse(responseCode = "200", description = "Ponto editado")
    @ApiResponse(responseCode = "400", description = "Campo obrigatório vazio ou inválido")
    @ApiResponse(responseCode = "404", description = "Ponto não encontrado")
    public PontoResponseDTO editar(@PathVariable("id") UUID id, @Valid @RequestBody PontoRequestDTO dto) {
        return service.editar(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Exclui um ponto")
    @ApiResponse(responseCode = "204", description = "Ponto excluído")
    @ApiResponse(responseCode = "404", description = "Ponto não encontrado")
    public void excluir(@PathVariable("id") UUID id) {
        service.excluir(id);
    }
}
