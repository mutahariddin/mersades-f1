import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useWishlist } from '../context/WishlistContext';
import { useLanguage } from '../context/LanguageContext';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard';
import styles from './WishlistPage.module.css';

export default function WishlistPage() {
  const { ids } = useWishlist();
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    if (ids.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all(ids.map(id => api.getProduct(id).catch(() => null)))
      .then(results => {
        if (!mounted) return;
        setProducts(results.filter(Boolean));
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [ids]);

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>{t('wishlist.title')}</h1>

        {loading && (
          <div className={styles.grid}>
            {Array(ids.length || 4).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>♡</span>
            <h2>{t('wishlist.empty')}</h2>
            <p>{t('wishlist.emptyHint')}</p>
            <Link to="/" className="btn btn-teal" style={{ marginTop: 24 }}>{t('wishlist.browse')}</Link>
          </div>
        )}

        {!loading && products.length > 0 && (
          <div className={styles.grid}>
            {products.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </div>
    </main>
  );
}
