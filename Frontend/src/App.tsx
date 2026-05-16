import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext';
import Navigation from './components/Navigation';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import EspeciesList from './pages/EspeciesList';
import EspecieDetail from './pages/EspecieDetail';
import DonacionesList from './pages/DonacionesList';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import UsuariosList from './pages/UsuariosList';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <LanguageProvider>
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/especies" element={<EspeciesList />} />
        <Route path="/especies/:id" element={<EspecieDetail />} />
        <Route path="/donaciones" element={
          <PrivateRoute>
            <DonacionesList />
          </PrivateRoute>
        } />
        <Route path="/usuarios" element={
          <PrivateRoute requireAdmin>
            <UsuariosList />
          </PrivateRoute>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
    </LanguageProvider>
  );
}

export default App;
