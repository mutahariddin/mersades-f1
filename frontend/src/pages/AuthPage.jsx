import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import styles from './AuthPage.module.css';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const { show } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        show(t('toast.welcome'));
      } else {
        await register(form.name, form.email, form.password);
        show(t('toast.accountCreated'));
      }
      navigate('/');
    } catch (e) {
      show(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleKey = e => { if (e.key === 'Enter') handleSubmit(e); };

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoAmg}>AMG</span>
          <span className={styles.logoF1}>F1 STORE</span>
        </Link>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button type="button" className={mode === 'login' ? styles.tabActive : styles.tab} onClick={() => setMode('login')}>{t('auth.login')}</button>
          <button type="button" className={mode === 'register' ? styles.tabActive : styles.tab} onClick={() => setMode('register')}>{t('auth.register')}</button>
        </div>

        <form className={styles.fields} onSubmit={handleSubmit} onKeyDown={handleKey}>
          {mode === 'register' && (
            <div className={styles.field}>
              <label>{t('auth.name')}</label>
              <input className="input" name="name" value={form.name} onChange={handleChange} placeholder={t('auth.namePlaceholder')}/>
            </div>
          )}
          <div className={styles.field}>
            <label>{t('auth.email')}</label>
            <input className="input" name="email" type="email" value={form.email} onChange={handleChange} placeholder="email@example.com"/>
          </div>
          <div className={styles.field}>
            <label>{t('auth.password')}</label>
            <input className="input" name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••"/>
          </div>

          <button type="submit" className={`btn btn-teal ${styles.submitBtn}`} disabled={loading}>
            {loading ? <span className="spinner" style={{width:18,height:18,borderWidth:2}}/> : null}
            {mode === 'login' ? t('auth.submitLogin') : t('auth.submitRegister')}
          </button>
        </form>

        <p className={styles.hint}>
          {mode === 'login' ? t('auth.noAccount') : t('auth.haveAccount')}
          <button type="button" className={styles.switchBtn} onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? t('auth.switchToRegister') : t('auth.switchToLogin')}
          </button>
        </p>
      </div>
    </main>
  );
}
