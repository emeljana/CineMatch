import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../context/userContext';
import Button from '../../Button/Button';
import './AppHeader.css';

function AppHeader({ action }) {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="app-header">
      <span className="app-header-logo">CineMatch</span>
      <div className="app-header-right">
        <span className="app-header-username">{user?.username}</span>
        {action}
        <Button variant="secondary" onClick={handleLogout}>Log out</Button>
      </div>
    </header>
  );
}

export default AppHeader;
