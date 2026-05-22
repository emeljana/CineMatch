import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/userContext';
import { WatchPartyProvider } from './context/watchPartyContext';
import { ToastProvider } from './context/toastContext';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import AdminRoute from './components/AdminRoute/AdminRoute';
import GuestRoute from './components/GuestRoute/GuestRoute';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import Landing from './pages/Landing/Landing';
import Home from './pages/Home/Home';
import Lobby from './pages/Lobby/Lobby';
import MatchHistory from './pages/MatchHistory/MatchHistory';
import WatchParty from './pages/WatchParty/WatchParty';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import NotFound from './pages/NotFound/NotFound';

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <ToastProvider>
          <WatchPartyProvider>
            <Routes>
              <Route element={<GuestRoute />}>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
              </Route>
              <Route element={<ProtectedRoute />}>
                <Route path="/home" element={<Home />} />
                <Route path="/watchparty/:id/lobby" element={<Lobby />} />
                <Route path="/watchparty/:id/matches" element={<MatchHistory />} />
                <Route path="/watchparty/:id" element={<WatchParty />} />
              </Route>
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </WatchPartyProvider>
        </ToastProvider>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
