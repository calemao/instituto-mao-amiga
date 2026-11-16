package br.com.maoamiga.api.config;

import br.com.maoamiga.api.entity.Ponto;
import br.com.maoamiga.api.repository.PontoRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Carga inicial de pontos em Goiânia. Roda a cada inicialização, mas só insere o ponto cujo nome
 * ainda não existe no banco: pode ser executada várias vezes sem duplicar.
 */
@Component
@RequiredArgsConstructor
public class CargaInicial implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(CargaInicial.class);

    private final PontoRepository repository;

    @Override
    public void run(String... args) {
        int inseridos = 0;
        for (Ponto ponto : PONTOS) {
            if (!repository.existsByNome(ponto.getNome())) {
                repository.save(ponto);
                inseridos++;
            }
        }
        log.info("Carga inicial: {} ponto(s) inserido(s); total no banco: {}", inseridos, repository.count());
    }

    private static Ponto ponto(String nome, String endereco, String bairro, String horario, String tipo) {
        return new Ponto(nome, endereco, bairro, horario, tipo);
    }

    private static final List<Ponto> PONTOS = List.of(
            ponto("Ponto de Coleta Setor Bueno",
                    "Rua T-30, nº 1200, Setor Bueno, Goiânia-GO, CEP 74223-060",
                    "Setor Bueno", "Segunda a sexta, das 8h às 17h", "coleta"),
            ponto("Ponto de Coleta Vila Nova",
                    "Avenida Anhanguera, nº 3400, Vila Nova, Goiânia-GO, CEP 74643-030",
                    "Vila Nova", "Sábados, das 7h às 12h", "coleta"),
            ponto("Ponto de Coleta Setor Campinas",
                    "Rua 3, nº 450, esquina com Avenida Goiás, Setor Campinas, Goiânia-GO, CEP 74513-090",
                    "Setor Campinas", "Terça, quinta e sábado, das 9h às 15h", "coleta"),
            ponto("Ponto de Distribuição Setor Sul",
                    "Avenida 85, nº 1500, Setor Sul, Goiânia-GO, CEP 74083-005",
                    "Setor Sul", "Segunda, quarta e sexta, das 14h às 18h", "distribuição"),
            ponto("Ponto de Coleta Jardim América",
                    "Rua 90, nº 320, Jardim América, Goiânia-GO, CEP 74275-110",
                    "Jardim América", "Terça e quinta, das 8h às 12h", "coleta"),
            ponto("Ponto de Distribuição Setor Pedro Ludovico",
                    "Avenida Engler, nº 780, Setor Pedro Ludovico, Goiânia-GO, CEP 74830-070",
                    "Setor Pedro Ludovico", "Segunda a sábado, das 9h às 16h", "distribuição"),
            ponto("Ponto de Coleta Setor Coimbra",
                    "Rua Coimbra, nº 210, Setor Coimbra, Goiânia-GO, CEP 74535-110",
                    "Setor Coimbra", "Quarta e sexta, das 13h às 17h", "coleta"),
            ponto("Ponto de Coleta Setor Marista",
                    "Rua 9, nº 1330, Setor Marista, Goiânia-GO, CEP 74150-030",
                    "Setor Marista", "Sábados e domingos, das 8h às 13h", "coleta")
    );
}
