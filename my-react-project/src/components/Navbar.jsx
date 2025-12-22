import { Link } from 'react-router-dom';

const Navbar = () => (
  <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
    <div className="container">
      <Link className="navbar-brand blog-header-logo" to="/">Yian's Blog</Link>
      <div className="navbar-nav">
        <Link className="nav-link" to="/">首頁/AI助手</Link>
        <Link className="nav-link" to="/hobby">Hobby</Link>
        <Link className="nav-link" to="/pet">Pet🐶</Link>
        <Link className="nav-link" to="/travel">Travel</Link>
      </div>
    </div>
  </nav>
);

export default Navbar;