import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './context/userContext';
import { WatchPartyProvider } from './context/watchPartyContext';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Home from './pages/Home/Home';
import WatchParty from './pages/WatchParty/WatchParty';

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <WatchPartyProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Home />} />
              <Route path="/watchparty/:id" element={<WatchParty />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </WatchPartyProvider>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
