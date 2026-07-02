import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import styles from './CartPage.module.css';

export default function CartPage() {
  const { items, removeItem, updateQty, total, fmt } = useCart();
  const { t, localize } = useLanguage();

  if (items.length === 0) return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>🛒</span>
          <h2>{t('cart.empty')}</h2>
          <p>{t('cart.emptyHint')}</p>
          <Link to="/" className="btn btn-teal" style={{ marginTop: 24 }}>{t('cart.toCatalog')}</Link>
        </div>
      </div>
    </main>
  );

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>{t('cart.title')}</h1>
        <div className={styles.layout}>
          <div className={styles.items}>
            {items.map(item => (
              <div key={item._key} className={styles.item}>
                <img src={item.image} alt={localize(item, 'name', 'nameRu')}/>
                <div className={styles.info}>
                  <p className={styles.itemName}>{localize(item, 'name', 'nameRu')}</p>
                  {item.size && <p className={styles.itemSize}>{t('cart.size')}: {item.size}</p>}
                  <p className={styles.itemPrice}>{fmt(item.price)}</p>
                </div>
                <div className={styles.qty}>
                  <button onClick={() => updateQty(item._key, item.quantity - 1)}>−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQty(item._key, item.quantity + 1)}>+</button>
                </div>
                <p className={styles.lineTotal}>{fmt(item.price * item.quantity)}</p>
                <button className={styles.remove} onClick={() => removeItem(item._key)}>✕</button>
              </div>
            ))}
          </div>

          <div className={styles.summary}>
            <h3>{t('cart.summary')}</h3>
            <div className={styles.row}>
              <span>{t('cart.itemsCount')}</span>
              <span>{items.reduce((s,i) => s + i.quantity, 0)} {t('cart.pieces')}</span>
            </div>
            <div className={`${styles.row} ${styles.totalRow}`}>
              <span>{t('cart.total')}</span>
              <span>{fmt(total)}</span>
            </div>
            <Link to="/checkout" className="btn btn-teal" style={{ display: 'block', textAlign: 'center', marginTop: 24, width: '100%' }}>
              {t('cart.checkout')}
            </Link>
            <Link to="/" style={{ display: 'block', textAlign: 'center', marginTop: 12, fontSize: 13, color: 'var(--muted)' }}>
              {t('cart.continueShopping')}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
