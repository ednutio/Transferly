import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppContextProvider } from './context/AppContext';
import { TelegramMiniAppProvider } from './context/TelegramMiniAppContext';
import { AdminRoute } from './components/AdminRoute';
import { MiniAppState } from './components/MiniAppState';
import { RouteErrorBoundary } from './components/RouteErrorBoundary';
import { RouteTransition } from './components/RouteTransition';

const AdminPage = lazy(() => import('./pages/AdminPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const HelpPage = lazy(() => import('./pages/HelpPage'));
const MiniAppPage = lazy(() => import('./pages/MiniAppPage'));

function RouteFallback() {
  return (
    <MiniAppState tone="loading" />
  );
}

function MiniAppRedirect({ to }) {
  const location = useLocation();

  return <Navigate to={`${to}${location.search}`} replace />;
}

function LegacyServiceRedirect() {
  const { slug = '' } = useParams();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const view = params.get('view');

  if (slug === 'paypal' && view === 'invoices') {
    return <Navigate to="/miniapp/invoices?provider=paypal" replace />;
  }

  if (slug === 'paypal' && view === 'payouts') {
    return <Navigate to="/miniapp/payouts?provider=paypal" replace />;
  }

  return <Navigate to={`/miniapp/services/${slug}${location.search}`} replace />;
}

function AppRoutes({ location }) {
  return (
    <Routes location={location}>
      {/* Public routes */}
      <Route path="/" element={<Navigate to="/miniapp" replace />} />
      <Route path="/login" element={<Navigate to="/miniapp" replace />} />
      <Route path="/forgot-password" element={<Navigate to="/miniapp" replace />} />
      <Route path="/register" element={<Navigate to="/miniapp" replace />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/help" element={<HelpPage />} />
      <Route path="/miniapp" element={<MiniAppPage />} />
      <Route path="/miniapp/:section" element={<MiniAppPage />} />
      <Route path="/miniapp/:section/:slug" element={<MiniAppPage />} />
      <Route path="/miniapp/:section/:slug/*" element={<MiniAppPage />} />

      {/* Legacy web-dashboard routes now land in the Telegram Mini App workspace. */}
      <Route path="/dashboard" element={<Navigate to="/miniapp" replace />} />
      <Route path="/services" element={<MiniAppRedirect to="/miniapp/services" />} />
      <Route path="/services/:slug" element={<LegacyServiceRedirect />} />
      <Route path="/buy-point" element={<MiniAppRedirect to="/miniapp/wallet" />} />
      <Route path="/buy-points" element={<MiniAppRedirect to="/miniapp/wallet" />} />
      <Route path="/transactions" element={<MiniAppRedirect to="/miniapp/vault" />} />
      <Route path="/orders" element={<MiniAppRedirect to="/miniapp/orders" />} />
      <Route path="/referral" element={<MiniAppRedirect to="/miniapp/profile" />} />
      <Route path="/profile" element={<MiniAppRedirect to="/miniapp/profile" />} />
      <Route path="/dashboard/generate" element={<MiniAppRedirect to="/miniapp/studio" />} />
      <Route path="/dashboard/history" element={<MiniAppRedirect to="/miniapp/vault" />} />
      <Route path="/dashboard/referral" element={<MiniAppRedirect to="/miniapp/profile" />} />
      <Route path="/dashboard/profile" element={<MiniAppRedirect to="/miniapp/profile" />} />

      {/* Admin route */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminPage />
          </AdminRoute>
        }
      />
      <Route path="*" element={<Navigate to="/miniapp" replace />} />
    </Routes>
  );
}

function AppFrame() {
  const location = useLocation();

  return (
    <RouteErrorBoundary resetKey={location.pathname}>
      <RouteTransition>
        {(transitionLocation) => (
          <Suspense fallback={<RouteFallback />}>
            <AppRoutes location={transitionLocation} />
          </Suspense>
        )}
      </RouteTransition>
      <Toaster position="top-right" />
    </RouteErrorBoundary>
  );
}

function App() {
  return (
    <AppContextProvider>
      <TelegramMiniAppProvider>
        <Router>
          <AppFrame />
        </Router>
      </TelegramMiniAppProvider>
    </AppContextProvider>
  );
}

export default App;
