import { Link } from 'react-router-dom';
import heroImage from '../../assets/hero.png';
import './Landing.css';

function Landing() {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <span className="landing-logo">CineMatch</span>
        <nav className="landing-nav" aria-label="Authentication">
          <Link to="/login" className="landing-nav-link">
            Log in
          </Link>
          <Link to="/register" className="landing-nav-cta">
            Register
          </Link>
        </nav>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-hero-content">
            <p className="landing-kicker">WatchParty movie matching</p>
            <h1>CineMatch</h1>
            <p className="landing-copy">
              Find the movie everyone wants to watch by swiping together with your friends.
            </p>
            <div className="landing-actions">
              <Link to="/register" className="landing-primary-action">
                Create account
              </Link>
              <Link to="/login" className="landing-secondary-action">
                Log in
              </Link>
            </div>
          </div>

          <div className="landing-visual" aria-hidden="true">
            <img src={heroImage} alt="" />
          </div>
        </section>

        <section className="landing-overview" aria-label="CineMatch highlights">
          <div>
            <span className="landing-stat">01</span>
            <h2>Create a WatchParty</h2>
            <p>Start a room and invite friends with a simple join code.</p>
          </div>
          <div>
            <span className="landing-stat">02</span>
            <h2>Swipe together</h2>
            <p>Everyone votes on the same movie queue from their own screen.</p>
          </div>
          <div>
            <span className="landing-stat">03</span>
            <h2>Pick the match</h2>
            <p>When the group likes the same title, CineMatch surfaces it for movie night.</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Landing;
