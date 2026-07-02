import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ProductCard.module.css';

export function ProductCardSkeleton() {
  return (
    <div className={styles.card} aria-hidden="true">
      <div className={`${styles.imgWrap} skeleton`} />
      <div className={styles.body}>
        <div className="skeleton" style={{ height: 11, width: '35%', marginBottom: 10 }} />
        <div className="skeleton" style={{ height: 17, width: '85%', marginBottom: 6 }} />
        <div className="skeleton" style={{ height: 13, width: '55%', marginBottom: 18 }} />
        <div className={styles.footer}>
          <div className="skeleton" style={{ height: 26, width: 64 }} />
          <div className="skeleton" style={{ height: 36, width: 110, borderRadius: 4 }} />
        </div>
      </div>
    </div>
  );
}

export default function ProductCard({ product }) {
  const { addItem, items, fmt } = useCart();
  const { toggle, has } = useWishlist();
  const { show } = useToast();
  const { t, localize } = useLanguage();
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || null);
  const [added, setAdded] = useState(false);

  const CAT_LABELS = t('common.category');
  const name = localize(product, 'name', 'nameRu');

  const wishlisted = has(product._id);
  const inCart = items.some(i => i._id === product._id && i.size === selectedSize);

  const handleAdd = useCallback((e) => {
    e.stopPropagation();
    if (inCart) return;
    addItem(product, selectedSize);
    show(t('toast.addedToCart', { name }));
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }, [inCart, addItem, product, selectedSize, show, t, name]);

  const handleWishlist = useCallback((e) => {
    e.stopPropagation();
    toggle(product._id);
    show(has(product._id)
      ? t('toast.removedFromWishlist', { name })
      : t('toast.addedToWishlist', { name })
    );
  }, [toggle, has, product, show, t, name]);

  const handleCardClick = () => navigate(`/product/${product._id}`);

  const badgeType = product.badge?.toLowerCase();

  return (
    <article
      className={`${styles.card} ${!product.inStock ? styles.cardOos : ''}`}
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      {/* Image */}
      <div className={styles.imgWrap}>
        <img
          src={product.image}
          alt={name}
          loading="lazy"
          className={styles.img}
          onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/600x400?text=No+image'; }}
        />

        {product.inStock && (
          <div className={styles.overlay}>
            <button
              className={`${styles.overlayBtn} ${inCart || added ? styles.overlayBtnAdded : ''}`}
              onClick={handleAdd}
              aria-label={`${t('common.addToCart')} ${name}`}
            >
              {added ? (
                <><CheckIcon /> {t('common.added')}</>
              ) : inCart ? (
                <><CheckIcon /> {t('common.inCart')}</>
              ) : (
                <><CartIcon /> {t('common.quickAdd')}</>
              )}
            </button>
          </div>
        )}

        {!product.inStock && (
          <div className={styles.oosOverlay}>
            <span>{t('common.outOfStock')}</span>
          </div>
        )}

        <div className={styles.badges}>
          {product.badge && (
            <span className={`${styles.badge} ${styles[`badge_${badgeType}`] || styles.badge_default}`}>
              {product.badge}
            </span>
          )}
        </div>

        <button
          className={`${styles.wishBtn} ${wishlisted ? styles.wishBtnActive : ''}`}
          onClick={handleWishlist}
          aria-label={wishlisted ? t('common.removeFromWishlist') : t('common.addToWishlist')}
        >
          <HeartIcon filled={wishlisted} />
        </button>
      </div>

      {/* Body */}
      <div className={styles.body}>
        <p className={styles.category}>{CAT_LABELS[product.category] || product.category}</p>
        <h3 className={styles.name}>{name}</h3>

        {product.sizes?.length > 0 && (
          <div className={styles.sizes} role="group" aria-label={t('product.size')} onClick={e => e.stopPropagation()}>
            {product.sizes.map(s => (
              <button
                key={s}
                className={`${styles.size} ${selectedSize === s ? styles.sizeActive : ''}`}
                onClick={(e) => { e.stopPropagation(); setSelectedSize(s); }}
                aria-pressed={selectedSize === s}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className={styles.footer}>
          <span className={styles.price}>{fmt(product.price)}</span>
          <button
            className={`${styles.btnAdd} ${inCart || added ? styles.btnAdded : ''}`}
            onClick={handleAdd}
            disabled={!product.inStock}
            aria-label={inCart ? t('common.inCart') : t('common.addToCart')}
          >
            {!product.inStock ? t('common.no') : inCart || added ? <><CheckIcon /> {t('common.inCart')}</> : t('common.addToCart')}
          </button>
        </div>
      </div>
    </article>
  );
}

function CartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}
function HeartIcon({ filled }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
}
