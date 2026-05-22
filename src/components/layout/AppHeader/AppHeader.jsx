import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../context/userContext';
import Button from '../../Button/Button';

function AppHeader({ action, className = '' }) {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className={`flex items-center justify-between px-8 py-4 border-b border-border bg-surface${className ? ` ${className}` : ''}`}>
      <span className="text-xl font-bold text-accent">CineMatch</span>
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted">{user?.username}</span>
        {action}
        <Button variant="secondary" onClick={handleLogout}>Log out</Button>
      </div>
    </header>
  );
}

export default AppHeader;
