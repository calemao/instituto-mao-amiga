package br.com.maoamiga.api.service;

import br.com.maoamiga.api.dto.DoacaoRequestDTO;
import br.com.maoamiga.api.dto.DoacaoResponseDTO;
import br.com.maoamiga.api.entity.Doacao;
import br.com.maoamiga.api.repository.DoacaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DoacaoService {

    private final DoacaoRepository repository;

    @Transactional(readOnly = true)
    public Page<DoacaoResponseDTO> buscarPorFiltro(String filtro, Pageable pageable) {
        String termo = filtro == null ? "" : filtro.trim().toUpperCase(Locale.ROOT);
        // O desempate por id mantém a ordem estável entre as páginas quando há datas iguais.
        Pageable estavel = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                pageable.getSort().and(Sort.by("id")));
        return repository.buscarPorFiltro(termo, estavel).map(DoacaoResponseDTO::from);
    }

    @Transactional(readOnly = true)
    public DoacaoResponseDTO buscarPorId(UUID id) {
        return DoacaoResponseDTO.from(buscarOuFalhar(id));
    }

    @Transactional
    public DoacaoResponseDTO cadastrar(DoacaoRequestDTO dto) {
        Doacao doacao = new Doacao();
        preencher(doacao, dto);
        // A data de cadastro é do servidor: não vem do app e não muda nas edições.
        // Cortada em microssegundos, a precisão do banco, para a resposta do cadastro ser igual às leituras seguintes.
        doacao.setCriadoEm(LocalDateTime.now().truncatedTo(ChronoUnit.MICROS));
        return DoacaoResponseDTO.from(repository.save(doacao));
    }

    @Transactional
    public DoacaoResponseDTO editar(UUID id, DoacaoRequestDTO dto) {
        Doacao doacao = buscarOuFalhar(id);
        preencher(doacao, dto);
        return DoacaoResponseDTO.from(repository.save(doacao));
    }

    @Transactional
    public void excluir(UUID id) {
        repository.delete(buscarOuFalhar(id));
    }

    private Doacao buscarOuFalhar(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Doação não encontrada."));
    }

    private void preencher(Doacao doacao, DoacaoRequestDTO dto) {
        doacao.setTipoItem(dto.tipoItem().trim());
        doacao.setQuantidade(dto.quantidade());
        doacao.setPontoDestino(dto.pontoDestino().trim());
    }
}
