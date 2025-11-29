import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import LoadingSpinner from './components/LoadingSpinner';

// Disable browser scroll restoration globally
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

// Lazy load pages for better performance
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ResumeBuilder = lazy(() => import('./pages/ResumeBuilder'));
const PortfolioBuilder = lazy(() => import('./pages/PortfolioBuilder'));
const PortfolioView = lazy(() => import('./pages/PortfolioView'));
const CoverLetterBuilder = lazy(() => import('./pages/CoverLetterBuilder'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Templates = lazy(() => import('./pages/Templates'));
const Analytics = lazy(() => import('./pages/Analytics'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const PaymentFailure = lazy(() => import('./pages/PaymentFailure'));
const JobAnalyzer = lazy(() => import('./pages/JobAnalyzer'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));

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
        <Suspense fallback={<LoadingSpinner fullScreen />}>
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
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
