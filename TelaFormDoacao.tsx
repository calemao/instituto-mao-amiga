import { useEffect, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { salvarDoacao, atualizarDoacao } from './doacoesStorage';

export default function TelaFormDoacao({ navigation, route }: { navigation: any; route: any }) {
    const [tipoItem, setTipoItem] = useState('');
    const [quantidadeInput, setQuantidadeInput] = useState('');
    const [pontoDestino, setPontoDestino] = useState('');
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');
    const [editandoId, setEditandoId] = useState<string | null>(null);
    const [editandoCriadoEm, setEditandoCriadoEm] = useState<string | null>(null);

    useEffect(() => {
        const doacaoParaEditar = route?.params?.doacaoParaEditar;
        if (doacaoParaEditar) {
            setTipoItem(doacaoParaEditar.tipoItem);
            setQuantidadeInput(String(doacaoParaEditar.quantidade));
            setPontoDestino(doacaoParaEditar.pontoDestino);
            setEditandoId(doacaoParaEditar.id);
            setEditandoCriadoEm(doacaoParaEditar.criadoEm);
            navigation.setOptions({ title: 'Editar doação' });
        }
    }, []);

    async function validarCadastro() {
        setSucesso('');

        if (tipoItem.trim() === '') {
            setErro('Informe o tipo do item doado.');
            return;
        }

        const quantidadeNumerica = Number(quantidadeInput.trim());
        if (
            quantidadeInput.trim() === '' ||
            isNaN(quantidadeNumerica) ||
            !Number.isInteger(quantidadeNumerica) ||
            quantidadeNumerica <= 0
        ) {
            setErro('A quantidade precisa ser um número inteiro maior que zero (ex.: 3).');
            return;
        }

        if (pontoDestino.trim() === '') {
            setErro('Informe o ponto de destino da doação.');
            return;
        }

        if (editandoId) {
            await atualizarDoacao({
                id: editandoId,
                tipoItem,
                quantidade: quantidadeNumerica,
                pontoDestino,
                criadoEm: editandoCriadoEm ?? new Date().toISOString(),
            });
            Keyboard.dismiss();
            navigation.goBack();
            return;
        }

        await salvarDoacao({
            id: Date.now().toString(),
            tipoItem,
            quantidade: quantidadeNumerica,
            pontoDestino,
            criadoEm: new Date().toISOString(),
        });

        setErro('');
        setSucesso('Doação registrada com sucesso!');
        setTipoItem('');
        setQuantidadeInput('');
        setPontoDestino('');
        Keyboard.dismiss();
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                    <Text style={styles.titulo}>
                        {editandoId ? 'Editar doação' : 'Cadastrar doação'}
                    </Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Tipo do item (ex.: roupas, alimentos)"
                        value={tipoItem}
                        onChangeText={setTipoItem}
                        disableFullscreenUI
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Quantidade (ex.: 3)"
                        value={quantidadeInput}
                        onChangeText={setQuantidadeInput}
                        keyboardType="number-pad"
                        disableFullscreenUI
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Ponto de destino (ex.: Ponto de Coleta Setor Bueno)"
                        value={pontoDestino}
                        onChangeText={setPontoDestino}
                        disableFullscreenUI
                    />

                    {erro !== '' && <Text style={styles.erro}>{erro}</Text>}
                    {sucesso !== '' && <Text style={styles.sucesso}>{sucesso}</Text>}

                    <TouchableOpacity style={styles.botaoCadastrar} onPress={validarCadastro}>
                        <Text style={styles.botaoCadastrarTexto}>
                            {editandoId ? 'Salvar alterações' : 'Registrar doação'}
                        </Text>
                    </TouchableOpacity>

                    {editandoId && (
                        <TouchableOpacity style={styles.botaoCancelar} onPress={() => navigation.goBack()}>
                            <Text style={styles.botaoCancelarTexto}>Cancelar edição</Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    flex: { flex: 1 },
    container: { alignItems: 'center', padding: 16 },
    titulo: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, alignSelf: 'flex-start' },
    input: { borderWidth: 1, borderColor: '#CCC', borderRadius: 6, padding: 10, fontSize: 14, width: '100%', marginBottom: 8, minHeight: 44 },
    erro: { color: '#C62828', fontSize: 13, marginBottom: 8, alignSelf: 'flex-start' },
    sucesso: { color: '#2E7D32', fontSize: 13, marginBottom: 8, alignSelf: 'flex-start' },
    botaoCadastrar: { backgroundColor: '#1B3A5C', padding: 12, borderRadius: 6, alignItems: 'center', width: '100%', minHeight: 44, justifyContent: 'center' },
    botaoCadastrarTexto: { color: '#fff', fontWeight: 'bold' },
    botaoCancelar: { borderWidth: 1, borderColor: '#999', padding: 12, borderRadius: 6, alignItems: 'center', width: '100%', marginTop: 8, minHeight: 44, justifyContent: 'center' },
    botaoCancelarTexto: { color: '#555', fontWeight: '600' },
});
