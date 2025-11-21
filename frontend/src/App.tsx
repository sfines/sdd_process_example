import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useSocket } from './hooks/useSocket.js';
import Home from './pages/Home';
import RoomView from './pages/RoomView';
import Toast from './components/Toast';

export default function App(): JSX.Element {
  // Initialize socket connection
  useSocket();

  return (
    <BrowserRouter>
      <Toast />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:roomCode" element={<RoomView />} />
      </Routes>
    </BrowserRouter>
  );
}
