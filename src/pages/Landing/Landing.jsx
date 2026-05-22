import { Link } from 'react-router-dom';
import CurtainScene from '../../components/cinema/CurtainScene';

const ACTION_BASE = 'inline-flex items-center justify-center min-h-[46px] px-6 rounded-md text-[15px] font-semibold no-underline transition-[opacity,border-color,transform] duration-150 active:scale-[0.98]';

function Landing() {
  return (
    <div className="min-h-screen bg-[#0d0d0f]">
      <header className="flex items-center justify-between px-8 py-[18px] border-b border-border bg-[rgba(13,14,20,0.94)] max-[820px]:px-5 max-[820px]:py-4 max-[480px]:flex-col max-[480px]:items-start max-[480px]:gap-3.5">
        <span className="text-xl font-bold text-[#f5eded]">CineMatch</span>
        <nav className="flex items-center gap-3.5" aria-label="Authentication">
          <Link
            to="/login"
            className="text-[15px] font-semibold no-underline text-muted hover:text-foreground transition-colors duration-150"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center py-[9px] px-[18px] rounded-md bg-[#8b1a1a] text-white text-[15px] font-semibold no-underline hover:opacity-[0.88] active:scale-[0.98] transition-[opacity,transform] duration-150"
          >
            Register
          </Link>
        </nav>
      </header>

      <main>
        <section className="relative min-h-[calc(100dvh-74px)] max-[820px]:min-h-[calc(100dvh-70px)]">
          <CurtainScene>
            <p className="mb-3.5 text-[#f4c7c7] text-[14px] font-bold tracking-[0.08em] uppercase">
              WatchParty movie matching
            </p>
            <h1 className="text-[clamp(42px,8vw,92px)] leading-[0.95] mb-[22px]">CineMatch</h1>
            <p className="max-w-[560px] text-[rgba(248,240,240,0.78)] text-[clamp(15px,2.2vw,20px)] leading-[1.55] max-[820px]:text-[18px]">
              Find the movie everyone wants to watch by swiping together with your friends.
            </p>
          </CurtainScene>
          <div
            className="absolute right-6 bottom-6 left-6 z-[8] flex flex-wrap justify-center gap-3.5 max-[480px]:flex-col max-[480px]:right-4 max-[480px]:bottom-4 max-[480px]:left-4"
            aria-label="Get started"
          >
            <Link
              to="/register"
              className={`${ACTION_BASE} bg-[#8b1a1a] text-white hover:opacity-[0.88] max-[480px]:w-full`}
            >
              Create account
            </Link>
            <Link
              to="/login"
              className={`${ACTION_BASE} border border-border text-foreground hover:border-muted max-[480px]:w-full`}
            >
              Log in
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-px bg-border border-t border-border max-[820px]:grid-cols-1" aria-label="CineMatch highlights">
          <div className="min-h-[210px] p-8 bg-surface">
            <span className="block mb-[34px] text-[#d98b8b] text-[13px] font-bold">01</span>
            <h2 className="mb-2.5 text-[19px] font-bold">Create a WatchParty</h2>
            <p className="text-muted text-[15px] leading-[1.6]">Start a room and invite friends with a simple join code.</p>
          </div>
          <div className="min-h-[210px] p-8 bg-surface">
            <span className="block mb-[34px] text-[#d98b8b] text-[13px] font-bold">02</span>
            <h2 className="mb-2.5 text-[19px] font-bold">Swipe together</h2>
            <p className="text-muted text-[15px] leading-[1.6]">Everyone votes on the same movie queue from their own screen.</p>
          </div>
          <div className="min-h-[210px] p-8 bg-surface">
            <span className="block mb-[34px] text-[#d98b8b] text-[13px] font-bold">03</span>
            <h2 className="mb-2.5 text-[19px] font-bold">Pick the match</h2>
            <p className="text-muted text-[15px] leading-[1.6]">When the group likes the same title, CineMatch surfaces it for movie night.</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Landing;
