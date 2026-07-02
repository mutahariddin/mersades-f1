import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import styles from './ProductPage.module.css';

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, items, fmt } = useCart();
  const { toggle, has } = useWishlist();
  const { show } = useToast();
  const { t, localize } = useLanguage();

  const CAT_LABELS = t('common.category');

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.getProduct(id)
      .then(p => { setProduct(p); setSelectedSize(p.sizes?.[0] || null); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const name = product ? localize(product, 'name', 'nameRu') : '';
  const wishlisted = product ? has(product._id) : false;
  const inCart = product ? items.some(i => i._id === product._id && i.size === selectedSize) : false;

  const handleAdd = () => {
    if (inCart || !product) return;
    addItem(product, selectedSize);
    show(t('toast.addedToCart', { name }));
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleWishlist = () => {
    if (!product) return;
    toggle(product._id);
    show(has(product._id)
      ? t('toast.removedFromWishlist', { name })
      : t('toast.addedToWishlist', { name })
    );
  };

  if (loading) return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.layout}>
          <div className={`${styles.imgWrap} skeleton`} />
          <div className={styles.info}>
            <div className="skeleton" style={{ height: 14, width: '30%', marginBottom: 16 }} />
            <div className="skeleton" style={{ height: 36, width: '80%', marginBottom: 12 }} />
            <div className="skeleton" style={{ height: 20, width: '40%', marginBottom: 32 }} />
            <div className="skeleton" style={{ height: 16, width: '100%', marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 16, width: '90%', marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 16, width: '70%' }} />
          </div>
        </div>
      </div>
    </main>
  );

  if (error) return (
    <main className={styles.page}>
      <div className={styles.container} style={{ textAlign: 'center', paddingTop: 80 }}>
        <p style={{ color: 'var(--error)', marginBottom: 20 }}>{error}</p>
        <button className="btn btn-ghost" onClick={() => navigate(-1)}>{t('common.back')}</button>
      </div>
    </main>
  );

  if (!product) return null;

  const badgeType = product.badge?.toLowerCase();
  const description = localize(product, 'description', 'descriptionRu');

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link to="/">{t('header.catalog')}</Link>
          <span>/</span>
          <span>{CAT_LABELS[product.category] || product.category}</span>
          <span>/</span>
          <span className={styles.breadcrumbCurrent}>{name}</span>
        </nav>

        <div className={styles.layout}>
          {/* Image */}
          <div className={styles.imgWrap}>
            <img
              src={product.image}
              alt={name}
              className={styles.img}
            />
            {product.badge && (
              <span className={`${styles.badge} ${styles[`badge_${badgeType}`] || styles.badge_default}`}>
                {product.badge}
              </span>
            )}
            {!product.inStock && (
              <div className={styles.oosOverlay}><span>{t('common.outOfStock')}</span></div>
            )}
          </div>

          {/* Info */}
          <div className={styles.info}>
            <p className={styles.category}>{CAT_LABELS[product.category] || product.category}</p>
            <h1 className={styles.name}>{name}</h1>
            {product.name && product.nameRu && product.name !== product.nameRu && (
              <p className={styles.nameEn}>{name === product.nameRu ? product.name : product.nameRu}</p>
            )}

            <p className={styles.price}>{fmt(product.price)}</p>

            {description && (
              <p className={styles.desc}>
                {description}
              </p>
            )}

            {/* Size picker */}
            {product.sizes?.length > 0 && (
              <div className={styles.sizeSection}>
                <p className={styles.sizeLabel}>
                  {t('product.size')}: <strong>{selectedSize}</strong>
                </p>
                <div className={styles.sizes} role="group">
                  {product.sizes.map(s => (
                    <button
                      key={s}
                      className={`${styles.size} ${selectedSize === s ? styles.sizeActive : ''}`}
                      onClick={() => setSelectedSize(s)}
                      aria-pressed={selectedSize === s}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className={styles.actions}>
              <button
                className={`btn btn-teal ${styles.addBtn}`}
                onClick={handleAdd}
                disabled={!product.inStock || inCart || added}
              >
                {!product.inStock ? t('common.outOfStock')
                  : added ? `✓ ${t('common.added')}`
                  : inCart ? `✓ ${t('common.inCart')}`
                  : t('common.addToCart')}
              </button>

              <button
                className={`${styles.wishBtn} ${wishlisted ? styles.wishBtnActive : ''}`}
                onClick={handleWishlist}
                aria-label={wishlisted ? t('common.removeFromWishlist') : t('common.addToWishlist')}
              >
                <HeartIcon filled={wishlisted} />
              </button>
            </div>

            {inCart && (
              <Link to="/cart" className={styles.goCart}>
                {t('product.goToCart')}
              </Link>
            )}

            {/* Meta */}
            <div className={styles.meta}>
              <div className={styles.metaRow}>
                <span>{t('product.category')}</span>
                <span>{CAT_LABELS[product.category] || product.category}</span>
              </div>
              <div className={styles.metaRow}>
                <span>{t('product.availability')}</span>
                <span style={{ color: product.inStock ? 'var(--success)' : 'var(--error)' }}>
                  {product.inStock ? t('common.inStock') : t('common.outOfStock')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function HeartIcon({ filled }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
}
