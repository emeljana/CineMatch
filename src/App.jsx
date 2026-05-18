import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './context/userContext';
import { WatchPartyProvider } from './context/watchPartyContext';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import GuestRoute from './components/GuestRoute/GuestRoute';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import Home from './pages/Home/Home';
import WatchParty from './pages/WatchParty/WatchParty';
import NotFound from './pages/NotFound/NotFound';

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <WatchPartyProvider>
          <Routes>
            <Route element={<GuestRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/home" element={<Home />} />
              <Route path="/watchparty/:id" element={<WatchParty />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </WatchPartyProvider>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
