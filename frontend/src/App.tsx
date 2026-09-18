import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import DebatePage from './pages/Debate';
import HistoryPage from './pages/History';
import { Scale } from 'lucide-react';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-ink text-paper font-sans flex flex-col">
        <header className="border-b border-gray-800 bg-ink/95 sticky top-0 z-10 backdrop-blur">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition">
              <Scale className="text-gold w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold tracking-widest text-paper">DEBATOR</h1>
                <p className="text-xs text-gray-400 tracking-wider">AI-POWERED MULTI-AGENT ARENA</p>
              </div>
            </Link>
            <nav className="flex gap-6 text-sm tracking-widest">
              <Link to="/" className="hover:text-gold transition">ARENA</Link>
              <Link to="/history" className="hover:text-gold transition">HISTORY</Link>
            </nav>
          </div>
        </header>

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<DebatePage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Routes>
        </main>
        
        <footer className="border-t border-gray-800 py-6 text-center text-xs text-gray-500 tracking-widest">
          DEBATOR &copy; {new Date().getFullYear()}
        </footer>
      </div>
    </Router>
  );
}

export default App;
