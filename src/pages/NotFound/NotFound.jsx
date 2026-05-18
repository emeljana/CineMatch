import { Link } from 'react-router-dom';
import { useUser } from '../../context/userContext';
import './NotFound.css';

function NotFound() {
  const { user } = useUser();

  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <span className="not-found-code">404</span>
        <h1 className="not-found-title">Sidan hittades inte</h1>
        <p className="not-found-desc">
          Sidan du letar efter finns inte eller har flyttats.
        </p>
        <Link to={user ? '/home' : '/login'} className="not-found-link">
          {user ? 'Tillbaka till startsidan' : 'Gå till inloggning'}
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
