import { StyleSheet, Text, View } from 'react-native';

type Ponto = {
    id: string;
    nome: string;
    endereco: string;
    diasHorarios: string;
    recebeDistribui: string;
};

const pontosMock: Ponto[] = [
    { id: '1', nome: 'Ponto de Coleta Setor Bueno', endereco: 'Rua T-30, próximo à Praça Cônego Vieira, Setor Bueno, Goiânia-GO', diasHorarios: 'Segunda a sexta, das 8h às 17h', recebeDistribui: 'Recebe roupas e calçados; distribui cestas básicas' },
    { id: '2', nome: 'Ponto de Coleta Vila Nova', endereco: 'Avenida Anhanguera, próximo à Feira da Vila Nova, Goiânia-GO', diasHorarios: 'Sábados, das 7h às 12h', recebeDistribui: 'Recebe alimentos não perecíveis; distribui cestas básicas' },
    { id: '3', nome: 'Ponto de Coleta Setor Campinas', endereco: 'Rua 3, esquina com Avenida Goiás, Setor Campinas, Goiânia-GO', diasHorarios: 'Terça, quinta e sábado, das 9h às 15h', recebeDistribui: 'Recebe roupas de inverno e cobertores; distribui agasalhos' },
];

function PontoItem({ ponto }: { ponto: Ponto }) {
    return (
        <View style={styles.item}>
            <Text style={styles.nome}>{ponto.nome}</Text>
            <Text style={styles.endereco}>{ponto.endereco}</Text>
        </View>
    );
}

export default function TelaListaPontos() {
    return (
        <View style={styles.container}>
            {pontosMock.map((ponto) => (
                <PontoItem key={ponto.id} ponto={ponto} />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 16 },
    item: { marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#E0E0E0', width: '100%' },
    nome: { fontSize: 16, fontWeight: 'bold', color: '#1B3A5C', textAlign: 'center' },
    endereco: { fontSize: 13, color: '#666', textAlign: 'center', marginTop: 4 },
});