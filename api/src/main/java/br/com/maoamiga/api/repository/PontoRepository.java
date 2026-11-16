package br.com.maoamiga.api.repository;

import br.com.maoamiga.api.entity.Ponto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface PontoRepository extends JpaRepository<Ponto, UUID> {

    // Procura no nome ou no bairro, sem diferenciar maiúsculas de minúsculas.
    // O service envia o filtro já em maiúsculas; filtro vazio devolve todos os pontos.
    @Query("""
            SELECT p FROM Ponto p
            WHERE UPPER(p.nome) LIKE CONCAT('%', :filtro, '%')
               OR UPPER(p.bairro) LIKE CONCAT('%', :filtro, '%')
            """)
    Page<Ponto> buscarPorFiltro(@Param("filtro") String filtro, Pageable pageable);

    boolean existsByNome(String nome);
}
