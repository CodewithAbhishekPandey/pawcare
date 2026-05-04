import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VetList from './pages/VetList';
import VetProfile from './pages/VetProfile';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import MyAppointments from './pages/MyAppointments';
import OwnerDashboard from './pages/OwnerDashboard';
import VetDashboard from './pages/VetDashboard';
import InstantConsult from './pages/InstantConsult';
import WaitingRoom from './pages/WaitingRoom';
import VideoRoom from './pages/VideoRoom';

// Admin
import AdminApp from './admin/AdminApp';

// Role-aware dashboard redirect
const Dashboard = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'vet') return <VetDashboard />;
  return <OwnerDashboard />;
};

function AppRoutes({ settings }) {
  return (
    <>
      <Navbar settings={settings} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home settings={settings} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/vets" element={<VetList />} />
          <Route path="/vets/:id" element={<VetProfile />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/instant-consult" element={<InstantConsult />} />

          {/* Admin Routes */}
          <Route path="/admin/*" element={<AdminApp />} />

          {/* Protected routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/cart" element={<Cart />} />
            <Route path="/appointments" element={<MyAppointments />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/waiting-room/:sessionId" element={<WaitingRoom />} />
            <Route path="/video/:roomId" element={<VideoRoom />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={
            <div className="text-center py-32">
              <p className="text-6xl mb-4">🐾</p>
              <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-3">Page Not Found</h2>
              <p className="text-slate-400 mb-8">Looks like this trail leads nowhere.</p>
              <a href="/" className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-semibold transition-colors">
                Go Home
              </a>
            </div>
          } />
        </Routes>
      </main>
    </>
  );
}

function App() {
  const [settings, setSettings] = React.useState({
    consult_enabled: true,
    marketplace_enabled: true,
    homepage_banner_text: "Premium Pet Care,",
    homepage_banner_subtext: "Delivered Daily.",
  });

  React.useEffect(() => {
    import('./api/axios').then(({ default: api }) => {
      api.get('/settings/public').then(res => {
        if (res.data.success && Object.keys(res.data.data).length > 0) {
          setSettings(prev => ({ ...prev, ...res.data.data }));
        }
      }).catch(err => console.error("Failed to load settings", err));
    });
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <SocketProvider>
            <BrowserRouter>
              <div className="min-h-screen bg-paw-pattern transition-colors duration-300">
                <AppRoutes settings={settings} />
              </div>
            </BrowserRouter>
          </SocketProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
