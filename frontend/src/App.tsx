import { ConnectionStatus } from './components/ConnectionStatus.js';

export default function App(): JSX.Element {
  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h1>D&D Dice Roller</h1>
      <ConnectionStatus />
    </div>
  );
}
