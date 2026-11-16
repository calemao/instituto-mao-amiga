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
                    "Setor Marista", "Sábados e domingos, das 8h às 13h", "coleta"),
            ponto("Ponto de Distribuição Setor Bueno",
                    "Rua T-55, nº 340, Setor Bueno, Goiânia-GO",
                    "Setor Bueno", "Terça e quinta, das 14h às 18h", "distribuição"),
            ponto("Ponto de Coleta Setor Oeste",
                    "Rua 5, nº 410, Setor Oeste, Goiânia-GO",
                    "Setor Oeste", "Segunda a sexta, das 9h às 17h", "coleta"),
            ponto("Ponto de Coleta Setor Central",
                    "Avenida Goiás, nº 1020, Setor Central, Goiânia-GO",
                    "Setor Central", "Segunda a sábado, das 8h às 18h", "coleta"),
            ponto("Ponto de Distribuição Jardim Goiás",
                    "Rua 17, nº 250, Jardim Goiás, Goiânia-GO",
                    "Jardim Goiás", "Sábados, das 8h às 12h", "distribuição"),
            ponto("Ponto de Coleta Setor Universitário",
                    "Avenida Universitária, nº 1500, Setor Universitário, Goiânia-GO",
                    "Setor Universitário", "Segunda a sexta, das 10h às 16h", "coleta"),
            ponto("Ponto de Coleta Parque Amazônia",
                    "Rua PA-12, nº 85, Parque Amazônia, Goiânia-GO",
                    "Parque Amazônia", "Quarta e sexta, das 8h às 12h", "coleta"),
            ponto("Ponto de Distribuição Jardim Novo Mundo",
                    "Rua JN-4, nº 120, Jardim Novo Mundo, Goiânia-GO",
                    "Jardim Novo Mundo", "Domingos, das 8h às 12h", "distribuição"),
            ponto("Ponto de Coleta Setor Leste Universitário",
                    "Rua 240, nº 90, Setor Leste Universitário, Goiânia-GO",
                    "Setor Leste Universitário", "Terça e quinta, das 13h às 17h", "coleta"),
            ponto("Ponto de Coleta Setor Aeroporto",
                    "Rua 6, nº 55, Setor Aeroporto, Goiânia-GO",
                    "Setor Aeroporto", "Segunda a sexta, das 8h às 12h", "coleta"),
            ponto("Ponto de Distribuição Setor Bela Vista",
                    "Rua 8, nº 300, Setor Bela Vista, Goiânia-GO",
                    "Setor Bela Vista", "Sábados, das 9h às 13h", "distribuição"),
            ponto("Ponto de Coleta Setor Jaó",
                    "Avenida Jaó, nº 1800, Setor Jaó, Goiânia-GO",
                    "Setor Jaó", "Quinta e sexta, das 14h às 18h", "coleta"),
            ponto("Ponto de Coleta Vila Rosa",
                    "Rua 12, nº 45, Vila Rosa, Goiânia-GO",
                    "Vila Rosa", "Segunda, quarta e sexta, das 8h às 11h", "coleta"),
            ponto("Ponto de Distribuição Setor Nova Suíça",
                    "Avenida T-9, nº 1100, Setor Nova Suíça, Goiânia-GO",
                    "Setor Nova Suíça", "Terças, das 9h às 16h", "distribuição"),
            ponto("Ponto de Coleta Setor dos Funcionários",
                    "Rua 32, nº 210, Setor dos Funcionários, Goiânia-GO",
                    "Setor dos Funcionários", "Segunda a sexta, das 9h às 15h", "coleta"),
            ponto("Ponto de Coleta Cidade Jardim",
                    "Rua CJ-3, nº 77, Cidade Jardim, Goiânia-GO",
                    "Cidade Jardim", "Sábados e domingos, das 8h às 12h", "coleta"),
            ponto("Ponto de Distribuição Residencial Eldorado",
                    "Rua RE-10, nº 150, Residencial Eldorado, Goiânia-GO",
                    "Residencial Eldorado", "Quartas, das 14h às 18h", "distribuição"),
            ponto("Ponto de Coleta Setor Negrão de Lima",
                    "Rua NL-2, nº 60, Setor Negrão de Lima, Goiânia-GO",
                    "Setor Negrão de Lima", "Segunda a sexta, das 8h às 14h", "coleta")
    );
}
