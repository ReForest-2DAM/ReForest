import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import EspeciesList from './pages/EspeciesList';
import EspecieDetail from './pages/EspecieDetail';
import DonacionesList from './pages/DonacionesList';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

function App() {
  return (
    <LanguageProvider>
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/especies" element={<EspeciesList />} />
        <Route path="/especies/:id" element={<EspecieDetail />} />
        <Route path="/donaciones" element={<DonacionesList />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
    </LanguageProvider>
  );
}

export default App;
