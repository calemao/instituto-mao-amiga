import { StyleSheet, Text, TouchableOpacity } from 'react-native';

// Coração de favoritar: ♡ vazio quando não é favorito, ♥ cheio quando é.
// A área de toque tem 48x48, acima do mínimo de 44x44.
export default function BotaoFavorito({
    favorito,
    onPress,
}: {
    favorito: boolean;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity
            style={styles.botao}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={favorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
            <Text style={styles.coracao}>{favorito ? '♥' : '♡'}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    botao: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
    coracao: { fontSize: 28, color: '#C62828' },
});
