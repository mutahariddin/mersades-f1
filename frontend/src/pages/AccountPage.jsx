import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api';
import styles from './AccountPage.module.css';

const STATUS_COLORS = {
  pending: '#f59e0b', paid: '#22c55e', confirmed: '#00d2be',
  shipped: '#3b82f6', delivered: '#22c55e', cancelled: '#ef4444',
};

export default function AccountPage() {
  const { user, logout } = useAuth();
  const { t, lang } = useLanguage();
  const STATUS_LABELS = t('account.status');
  const locale = lang === 'ru' ? 'ru-RU' : 'en-US';
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [tab, setTab] = useState('orders');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.myOrders()
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoadingOrders(false));
  }, [user]);

  const handleLogout = () => { logout(); navigate('/'); };

  if (!user) return null;

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        {/* Profile header */}
        <div className={styles.profileHeader}>
          <div className={styles.avatarLarge}>{user.name[0].toUpperCase()}</div>
          <div>
            <h1 className={styles.name}>{user.name}</h1>
            <p className={styles.email}>{user.email}</p>
            <p className={styles.since}>{t('account.memberSince')} {new Date(user.createdAt).toLocaleDateString(locale, { year: 'numeric', month: 'long' })}</p>
          </div>
          <button className={`btn btn-ghost ${styles.logoutBtn}`} onClick={handleLogout}>{t('account.logout')}</button>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button className={tab === 'orders' ? styles.tabActive : styles.tab} onClick={() => setTab('orders')}>
            {t('account.orderHistory')} {orders.length > 0 && <span className={styles.count}>{orders.length}</span>}
          </button>
        </div>

        {/* Orders */}
        {tab === 'orders' && (
          <div className={styles.orders}>
            {loadingOrders && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                <div className="spinner"/>
              </div>
            )}
            {!loadingOrders && orders.length === 0 && (
              <div className={styles.emptyOrders}>
                <p>{t('account.noOrders')}</p>
                <button className="btn btn-teal" onClick={() => navigate('/')} style={{ marginTop: 16 }}>
                  {t('account.goToCatalog')}
                </button>
              </div>
            )}
            {orders.map(order => (
              <div key={order._id} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <div>
                    <p className={styles.orderId}>{t('account.orderNumber')}{order._id.slice(-8).toUpperCase()}</p>
                    <p className={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <span className={styles.status} style={{ color: STATUS_COLORS[order.status], borderColor: STATUS_COLORS[order.status] }}>
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                </div>
                <div className={styles.orderItems}>
                  {order.items.map((item, i) => (
                    <div key={i} className={styles.orderItem}>
                      {item.image && <img src={item.image} alt={item.name}/>}
                      <div>
                        <p className={styles.orderItemName}>{item.name}</p>
                        <p className={styles.orderItemMeta}>{item.quantity} × ${item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className={styles.orderTotal}>
                  {t('account.total')}: <strong>${order.total}</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
