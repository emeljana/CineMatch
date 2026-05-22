import { Link } from 'react-router-dom';
import { useUser } from '../../context/userContext';

function NotFound() {
  const { user } = useUser();

  return (
    <div className="flex items-center justify-center min-h-screen bg-bg p-6">
      <div className="text-center flex flex-col items-center gap-4">
        <span className="text-[96px] font-bold leading-none text-accent opacity-40">404</span>
        <h1 className="text-[28px] font-semibold">Sidan hittades inte</h1>
        <p className="text-[15px] text-muted">Sidan du letar efter finns inte eller har flyttats.</p>
        <Link
          to={user ? '/home' : '/login'}
          className="mt-2 inline-flex px-6 py-2.5 bg-accent !text-white rounded-md text-[15px] font-medium no-underline hover:opacity-[0.88] hover:no-underline transition-opacity duration-150"
        >
          {user ? 'Tillbaka till startsidan' : 'Gå till inloggning'}
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
