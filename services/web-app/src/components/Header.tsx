import { Link } from 'react-router-dom';
import '../styles/Header.css';

function Header() {
  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <h1>🎮 BucStop</h1>
        </Link>
        <nav className="nav">
          <Link to="/" className="nav-link">Games</Link>
          <Link to="/stats" className="nav-link">Stats</Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
