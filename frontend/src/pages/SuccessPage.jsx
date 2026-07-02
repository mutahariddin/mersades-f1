import { useLocation, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import styles from './SuccessPage.module.css';

export default function SuccessPage() {
  const { state } = useLocation();
  const { orderId, total } = state || {};
  const { t } = useLanguage();

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.check}>✓</div>
        <h1 className={styles.title}>{t('success.title')}</h1>
        {orderId && <p className={styles.id}>№ {String(orderId).slice(-8).toUpperCase()}</p>}
        {total  && <p className={styles.total}>{t('success.amount')}: <strong>${total}</strong></p>}
        <p className={styles.note}>{t('success.note')}</p>
        <p className={styles.thanks}>{t('success.thanks')}</p>
        <div className={styles.actions}>
          <Link to="/account" className="btn btn-ghost">{t('success.myOrders')}</Link>
          <Link to="/" className="btn btn-teal">{t('success.toShop')}</Link>
        </div>
      </div>
    </main>
  );
}
