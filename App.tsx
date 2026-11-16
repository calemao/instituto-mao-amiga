import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TelaListaPontos from './TelaListaPontos';
import TelaDetalhePonto from './TelaDetalhePonto';
import TelaMinhasDoacoes from './TelaMinhasDoacoes';
import TelaDetalheDoacao from './TelaDetalheDoacao';
import TelaFormDoacao from './TelaFormDoacao';
import TelaFormPonto from './TelaFormPonto';
import TelaMeusPontos from './TelaMeusPontos';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="ListaPontos">
        <Stack.Screen
          name="ListaPontos"
          component={TelaListaPontos}
          options={{ title: 'Pontos de Coleta' }}
        />
        <Stack.Screen
          name="DetalhePonto"
          component={TelaDetalhePonto}
          options={{ title: 'Detalhe do Ponto' }}
        />
        <Stack.Screen
          name="FormPonto"
          component={TelaFormPonto}
          options={{ title: 'Cadastrar ponto' }}
        />
        <Stack.Screen
          name="MeusPontos"
          component={TelaMeusPontos}
          options={{ title: 'Meus pontos' }}
        />
        <Stack.Screen
          name="FormDoacao"
          component={TelaFormDoacao}
          options={{ title: 'Registrar doação' }}
        />
        <Stack.Screen
          name="MinhasDoacoes"
          component={TelaMinhasDoacoes}
          options={{ title: 'Minhas Doações' }}
        />
        <Stack.Screen
          name="DetalheDoacao"
          component={TelaDetalheDoacao}
          options={{ title: 'Detalhe da Doação' }}
        />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}