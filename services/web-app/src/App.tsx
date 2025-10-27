import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import GameDetailPage from './pages/GameDetailPage';
import GamePlayPage from './pages/GamePlayPage';
import StatsPage from './pages/StatsPage';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/game/:gameName" element={<GameDetailPage />} />
            <Route path="/game/:gameName/play" element={<GamePlayPage />} />
            <Route path="/stats" element={<StatsPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
