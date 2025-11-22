import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useSocket } from './hooks/useSocket.js';
import Home from './pages/Home';
import RoomView from './pages/RoomView';
import Toast from './components/Toast';
import { ConnectionStatus } from './components/ConnectionStatus';

export default function App(): JSX.Element {
  // Initialize socket connection
  useSocket();

  return (
    <BrowserRouter>
      <div className="fixed top-4 right-4 z-50">
        <ConnectionStatus />
      </div>
      <Toast />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:roomCode" element={<RoomView />} />
      </Routes>
    </BrowserRouter>
  );
}
