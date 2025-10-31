import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Settings from './pages/Settings';
import EditDecks from './pages/EditDecks';
import CreateDeck from './pages/CreateDeck';
import EditDeck from './pages/EditDeck';
import EditCards from './pages/EditCards';
import Cards from './pages/Cards';
import { AuthProvider } from "./components/AuthContext";
import './i18n';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Header />
          <div className='page-container'>
            <div className='page'>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/edit-decks" element={<EditDecks />} />
                <Route path="/create-deck" element={<CreateDeck />} />
                <Route path="/edit-deck" element={<EditDeck />} />
                <Route path="/edit-cards" element={<EditCards />} />
                <Route path="/cards" element={<Cards />} />
              </Routes>
            </div>
          </div>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;