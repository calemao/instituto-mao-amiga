package br.com.maoamiga.api.repository;

import br.com.maoamiga.api.entity.Doacao;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface DoacaoRepository extends JpaRepository<Doacao, UUID> {

    // Procura no tipo do item, sem diferenciar maiúsculas de minúsculas.
    // O service envia o filtro já em maiúsculas; filtro vazio devolve todas as doações.
    @Query("""
            SELECT d FROM Doacao d
            WHERE UPPER(d.tipoItem) LIKE CONCAT('%', :filtro, '%')
            """)
    Page<Doacao> buscarPorFiltro(@Param("filtro") String filtro, Pageable pageable);
}
