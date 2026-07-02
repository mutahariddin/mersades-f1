import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import styles from './Header.module.css';

export default function Header() {
  const { count } = useCart();
  const { count: wishCount } = useWishlist();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLang, t } = useLanguage();
  const showAdmin = (user && user.role === 'admin') || import.meta.env.VITE_FORCE_ADMIN === 'true';
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setUserOpen(false);
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoAmg}>AMG</span>
          <span className={styles.logoF1}>F1 STORE</span>
        </Link>

        <nav className={styles.nav}>
          <Link to="/" className={pathname === '/' ? styles.active : ''}>{t('header.catalog')}</Link>
          <Link to="/pilots" className={pathname === '/pilots' ? styles.active : ''}>{t('header.pilots')}</Link>
          {showAdmin && (
            <Link to="/admin" className={pathname === '/admin' ? styles.active : ''}>{t('header.admin')}</Link>
          )}

          <button className={styles.iconToggle} onClick={toggleLang} aria-label={t('header.langToggleAria')} title={t('header.langToggleAria')}>
            {lang.toUpperCase()}
          </button>

          <button className={styles.iconToggle} onClick={toggleTheme} aria-label={t('header.themeToggleAria')} title={t('header.themeToggleAria')}>
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>

          <Link to="/wishlist" className={styles.cartBtn} aria-label={t('header.wishlistAria')}>
            <HeartIcon />
            {wishCount > 0 && <span className={styles.badge}>{wishCount}</span>}
          </Link>

          <Link to="/cart" className={styles.cartBtn} aria-label={t('header.cartAria')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {count > 0 && <span className={styles.badge}>{count}</span>}
          </Link>

          {user ? (
            <div className={styles.userWrap}>
              <button className={styles.userBtn} onClick={() => setUserOpen((v) => !v)}>
                <span className={styles.avatar}>{user.name?.[0]?.toUpperCase() || 'U'}</span>
                <span className={styles.userName}>{user.name?.split(' ')[0] || 'User'}</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M2 4l4 4 4-4" /></svg>
              </button>
              {userOpen && (
                <div className={styles.dropdown}>
                  <Link to="/account" onClick={() => setUserOpen(false)}>{t('header.account')}</Link>
                  {showAdmin && (
                    <Link to="/admin" onClick={() => setUserOpen(false)}>{t('header.adminPanel')}</Link>
                  )}
                  <button onClick={handleLogout}>{t('header.logout')}</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className={`btn btn-ghost ${styles.loginBtn}`}>{t('header.login')}</Link>
          )}
        </nav>

        <button className={styles.burger} onClick={() => setMenuOpen((v) => !v)} aria-label={t('header.menuAria')}>
          <span className={menuOpen ? styles.burgerOpen : ''} />
        </button>
      </div>

      {menuOpen && (
        <div className={styles.mobileMenu} onClick={() => setMenuOpen(false)}>
          <Link to="/">{t('header.catalog')}</Link>
          <Link to="/pilots">{t('header.pilots')}</Link>
          <Link to="/wishlist">{t('header.wishlist')} {wishCount > 0 && `(${wishCount})`}</Link>
          <Link to="/cart">{t('header.cartAria')} {count > 0 && `(${count})`}</Link>
          <div className={styles.mobileToggles} onClick={(e) => e.stopPropagation()}>
            <button className={styles.iconToggle} onClick={toggleLang}>{lang.toUpperCase()}</button>
            <button className={styles.iconToggle} onClick={toggleTheme}>
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
          {user ? (
            <>
              <Link to="/account">{t('header.account')}</Link>
              {showAdmin && <Link to="/admin">{t('header.adminPanel')}</Link>}
              <button onClick={handleLogout}>{t('header.logout')}</button>
            </>
          ) : (
            <Link to="/login">{t('header.login')}</Link>
          )}
        </div>
      )}
    </header>
  );
}

function HeartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
}
function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}
