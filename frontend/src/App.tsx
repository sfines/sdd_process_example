import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useSocket } from './hooks/useSocket.js';
import Home from './pages/Home';
import RoomView from './pages/RoomView';

function AppContent(): JSX.Element {
  // Initialize socket connection (must be inside Router for useNavigate to work)
  useSocket();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/room/:roomCode" element={<RoomView />} />
    </Routes>
  );
}

export default function App(): JSX.Element {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
