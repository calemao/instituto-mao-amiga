package br.com.maoamiga.api.service;

import br.com.maoamiga.api.dto.PontoRequestDTO;
import br.com.maoamiga.api.dto.PontoResponseDTO;
import br.com.maoamiga.api.entity.Ponto;
import br.com.maoamiga.api.repository.PontoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PontoService {

    private final PontoRepository repository;

    @Transactional(readOnly = true)
    public List<PontoResponseDTO> listar() {
        return repository.findAll().stream().map(PontoResponseDTO::from).toList();
    }

    @Transactional(readOnly = true)
    public PontoResponseDTO buscarPorId(UUID id) {
        return PontoResponseDTO.from(buscarOuFalhar(id));
    }

    @Transactional
    public PontoResponseDTO cadastrar(PontoRequestDTO dto) {
        Ponto ponto = new Ponto();
        preencher(ponto, dto);
        return PontoResponseDTO.from(repository.save(ponto));
    }

    @Transactional
    public PontoResponseDTO editar(UUID id, PontoRequestDTO dto) {
        Ponto ponto = buscarOuFalhar(id);
        preencher(ponto, dto);
        return PontoResponseDTO.from(repository.save(ponto));
    }

    @Transactional
    public void excluir(UUID id) {
        repository.delete(buscarOuFalhar(id));
    }

    private Ponto buscarOuFalhar(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ponto não encontrado."));
    }

    private void preencher(Ponto ponto, PontoRequestDTO dto) {
        ponto.setNome(dto.nome().trim());
        ponto.setEndereco(dto.endereco().trim());
        ponto.setBairro(dto.bairro().trim());
        ponto.setHorario(dto.horario().trim());
        ponto.setTipo(dto.tipo().trim().toLowerCase(Locale.ROOT));
    }
}
