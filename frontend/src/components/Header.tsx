import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, User, Heart, Menu, X, LogOut } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import styles from "./Header.module.css";

const Header = () => {
  const { cart, wishlist } = useCart();
  const { user, logout } = useAuth();
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const wishlistItemCount = wishlist.length;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>
        <img src="/logo.jpg" alt="TinTin Logo" />
      </Link>

      <nav className={styles.nav}>
        <Link to="/category/men" className={styles.navLink}>
          Men
        </Link>
        <Link to="/category/women" className={styles.navLink}>
          Women
        </Link>
        <Link to="/category/kids" className={styles.navLink}>
          Kids
        </Link>
      </nav>

      <div className={styles.actions}>
        <Link to="/wishlist" className={styles.iconBtn} title="Wishlist">
          <Heart size={24} />
          {wishlistItemCount > 0 && (
            <span className={styles.badge}>{wishlistItemCount}</span>
          )}
        </Link>
        {user ? (
          <>
            <Link
              to={user.role === "ADMIN" ? "/dashboard" : "/profile"}
              className={styles.iconBtn}
              title={user.role === "ADMIN" ? "Dashboard" : "Profile"}
            >
              <User size={24} />
            </Link>
            <button className={styles.iconBtn} title="Logout" onClick={logout}>
              <LogOut size={24} />
            </button>
          </>
        ) : (
          <Link to="/login" className={styles.iconBtn} title="Login">
            <User size={24} />
          </Link>
        )}
        <Link to="/cart" className={styles.iconBtn} title="Cart">
          <ShoppingBag size={24} />
          {cartItemCount > 0 && (
            <span className={styles.badge}>{cartItemCount}</span>
          )}
        </Link>
      </div>

      <button
        className={styles.mobileMenuBtn}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Mobile Menu Dropdown */}
      <div
        className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.open : ""}`}
      >
        <Link
          to="/category/men"
          className={styles.navLink}
          onClick={() => setMobileMenuOpen(false)}
        >
          Men
        </Link>
        <Link
          to="/category/women"
          className={styles.navLink}
          onClick={() => setMobileMenuOpen(false)}
        >
          Women
        </Link>
        <Link
          to="/category/kids"
          className={styles.navLink}
          onClick={() => setMobileMenuOpen(false)}
        >
          Kids
        </Link>

        <div className={styles.mobileActions}>
          <Link
            to="/wishlist"
            className={styles.iconBtn}
            title="Wishlist"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Heart size={24} />
            {wishlistItemCount > 0 && (
              <span className={styles.badge}>{wishlistItemCount}</span>
            )}
          </Link>
          {user ? (
            <>
              <Link
                to={user.role === "ADMIN" ? "/dashboard" : "/profile"}
                className={styles.iconBtn}
                title={user.role === "ADMIN" ? "Dashboard" : "Profile"}
                onClick={() => setMobileMenuOpen(false)}
              >
                <User size={24} />
              </Link>
              <button
                className={styles.iconBtn}
                title="Logout"
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
              >
                <LogOut size={24} />
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className={styles.iconBtn}
              title="Login"
              onClick={() => setMobileMenuOpen(false)}
            >
              <User size={24} />
            </Link>
          )}
          <Link
            to="/cart"
            className={styles.iconBtn}
            title="Cart"
            onClick={() => setMobileMenuOpen(false)}
          >
            <ShoppingBag size={24} />
            {cartItemCount > 0 && (
              <span className={styles.badge}>{cartItemCount}</span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
