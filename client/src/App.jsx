import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ResumeBuilder from './pages/ResumeBuilder';
import PortfolioBuilder from './pages/PortfolioBuilder';
import PortfolioView from './pages/PortfolioView';
import CoverLetterBuilder from './pages/CoverLetterBuilder';
import Pricing from './pages/Pricing';
import Templates from './pages/Templates';
import Analytics from './pages/Analytics';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';
import JobAnalyzer from './pages/JobAnalyzer';

const PrivateRoute = ({ children }) => {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/login" />;
};

const Layout = ({ children }) => {
  const location = useLocation();
  const hideNavbar = ['/login', '/register'].includes(location.pathname) || 
                     location.pathname.startsWith('/portfolio/public/');

  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Toaster position="top-right" />
      <Layout>
        <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/templates" element={<Templates />} />
        
        <Route path="/dashboard" element={
          <PrivateRoute><Dashboard /></PrivateRoute>
        } />
        <Route path="/analytics" element={
          <PrivateRoute><Analytics /></PrivateRoute>
        } />
        <Route path="/resume/new" element={
          <PrivateRoute><ResumeBuilder /></PrivateRoute>
        } />
        <Route path="/resume/:id" element={
          <PrivateRoute><ResumeBuilder /></PrivateRoute>
        } />
        <Route path="/portfolio/new" element={
          <PrivateRoute><PortfolioBuilder /></PrivateRoute>
        } />
        <Route path="/portfolio/:id" element={
          <PrivateRoute><PortfolioBuilder /></PrivateRoute>
        } />
        <Route path="/portfolio/public/:subdomain" element={<PortfolioView />} />
        <Route path="/cover-letter/new" element={
          <PrivateRoute><CoverLetterBuilder /></PrivateRoute>
        } />
        <Route path="/cover-letter/:id" element={
          <PrivateRoute><CoverLetterBuilder /></PrivateRoute>
        } />
        <Route path="/job-analyzer" element={
          <PrivateRoute><JobAnalyzer /></PrivateRoute>
        } />
        <Route path="/payment/success" element={
          <PrivateRoute><PaymentSuccess /></PrivateRoute>
        } />
        <Route path="/payment/failure" element={
          <PrivateRoute><PaymentFailure /></PrivateRoute>
        } />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
