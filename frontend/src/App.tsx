import { useEffect, useRef, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Category from "./pages/Category";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProductDetails from "./pages/ProductDetails";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Checkout from "./pages/Checkout";


function LoadingOverlay() {
  const location = useLocation();
  const [routeLoading, setRouteLoading] = useState(false);
  const [pendingFetches, setPendingFetches] = useState(0);
  const routeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const originalFetch = window.fetch.bind(window);

    const wrappedFetch = (
      input: RequestInfo | URL,
      init?: RequestInit,
    ): Promise<Response> => {
      setPendingFetches((count) => count + 1);

      return originalFetch(input, init).finally(() => {
        setPendingFetches((count) => Math.max(0, count - 1));
      });
    };

    window.fetch = wrappedFetch as typeof window.fetch;

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  useEffect(() => {
    setRouteLoading(true);

    if (routeTimerRef.current) {
      window.clearTimeout(routeTimerRef.current);
    }

    routeTimerRef.current = window.setTimeout(() => {
      setRouteLoading(false);
    }, 350);

    return () => {
      if (routeTimerRef.current) {
        window.clearTimeout(routeTimerRef.current);
      }
    };
  }, [location.pathname]);

  const visible = routeLoading || pendingFetches > 0;

  if (!visible) {
    return null;
  }

  return (
    <div className="loading-overlay" aria-live="polite" aria-busy={visible}>
      <div className="loading-card">
        <img src="/loading.svg" alt="Loading" className="loading-spinner" />
        <span>Loading</span>
      </div>
    </div>
  );
}

function AppContent() {
  return (
    <>
      <LoadingOverlay />
      <div
        style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <Header />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/category/:id" element={<Category />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
