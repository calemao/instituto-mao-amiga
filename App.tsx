import { StatusBar } from 'expo-status-bar';
import TelaListaPontos from './TelaListaPontos';
// import TelaDetalhePonto from './TelaDetalhePonto';

export default function App() {
  return (
    <>
      <TelaListaPontos />
      <StatusBar style="auto" />
    </>
  );
}