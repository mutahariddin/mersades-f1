import { useState, useEffect } from 'react';
import { api } from '../api';
import { useLanguage } from '../context/LanguageContext';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard';
import styles from './ShopPage.module.css';

export default function ShopPage() {
  const { t } = useLanguage();

  const CATS = [
    { value: '', label: t('shop.cats.all') },
    { value: 'clothing', label: t('shop.cats.clothing') },
    { value: 'accessories', label: t('shop.cats.accessories') },
    { value: 'collectibles', label: t('shop.cats.collectibles') },
  ];

  const SORTS = [
    { value: '', label: t('shop.sorts.newest') },
    { value: 'price_asc', label: t('shop.sorts.priceAsc') },
    { value: 'price_desc', label: t('shop.sorts.priceDesc') },
  ];

  const STATS = [
    { value: '9×', label: t('shop.stats.constructors') },
    { value: 'W16', label: t('shop.stats.car') },
    { value: '125+', label: t('shop.stats.wins') },
    { value: '1954', label: t('shop.stats.founded') },
  ];

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [assistantInput, setAssistantInput] = useState('');
  const [assistantResult, setAssistantResult] = useState(null);
  const [assistantLoading, setAssistantLoading] = useState(false);
  const LIMIT = 20;

  useEffect(() => {
    let mounted = true;
    setLoading(true); setError(null); setPage(1);
    const params = { page: 1, limit: LIMIT };
    if (category) params.category = category;
    if (sort) params.sort = sort;
    if (query) params.search = query;
    api.getProductsFull(params)
      .then(data => {
        if (!mounted) return;
        setProducts(Array.isArray(data) ? data : (data.products || []));
        setPages(data.pages || 1);
        setPage(data.page || 1);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
    return () => { mounted = false; };
  }, [category, sort, query]);

  const loadMore = async () => {
    if (loadingMore || page >= pages) return;
    const next = page + 1;
    setLoadingMore(true);
    const params = { page: next, limit: LIMIT };
    if (category) params.category = category;
    if (sort) params.sort = sort;
    if (query) params.search = query;
    try {
      const data = await api.getProductsFull(params);
      const more = Array.isArray(data) ? data : (data.products || []);
      setProducts(prev => [...prev, ...more]);
      setPage(data.page || next);
      setPages(data.pages || pages);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSearch = (e) => { e.preventDefault(); setQuery(search); };

  const handleAssistantSubmit = async (e) => {
    e.preventDefault();
    const prompt = assistantInput.trim();
    if (!prompt) return;

    setAssistantLoading(true);

    try {
      const data = await api.aiRecommend({ prompt, products });
      setAssistantResult({
        prompt: prompt.length > 60 ? `${prompt.slice(0, 60)}…` : prompt,
        items: Array.isArray(data.items) ? data.items : [],
        note: data.note || t('shop.aiDefaultNote'),
      });
    } catch (error) {
      setAssistantResult({
        prompt: prompt.length > 60 ? `${prompt.slice(0, 60)}…` : prompt,
        items: [],
        note: error.message || 'AI recommendation failed.',
      });
    } finally {
      setAssistantLoading(false);
    }
  };

  const featured = products.filter(p => p.badge || p.inStock).slice(0, 20);
  const showFeatured = !loading && !error && featured.length > 0 && !query && !category;

  return (
    <main className={styles.page}>
      {/* ── Hero ── */}
      <section className={styles.hero} aria-label="Hero">
        <div className={styles.heroBg} aria-hidden>
          <div className={styles.heroBgGlow} />
          <div className={styles.heroBgGrid} />
          {/* Decorative speed lines */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className={styles.speedLine} style={{ '--i': i }} aria-hidden />
          ))}
        </div>

        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            <p className={styles.eyebrow}>
              <span className={styles.eyebrowDot} />
              SEASON 2025 · MERCEDES-AMG PETRONAS
            </p>
            <h1 className={styles.heroTitle}>
              Silver<br/>
              <span className={styles.heroTitleAccent}>Arrow</span><br/>
              <span className={styles.heroTitleSub}>Official Store</span>
            </h1>
            <p className={styles.heroDesc}>
              {t('shop.heroDesc')}
            </p>
            <button
              className={styles.heroCta}
              onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t('shop.heroCta')}
              <ArrowDownIcon />
            </button>

            <section className={styles.aiAssistant} aria-label="AI stylist">
              <div className={styles.aiAssistantCard}>
                <div className={styles.aiAssistantHeader}>
                  <span className={styles.aiAssistantBadge}>AI</span>
                  <div>
                    <h2 className={styles.aiAssistantTitle}>{t('shop.aiTitle')}</h2>
                    <p className={styles.aiAssistantText}>{t('shop.aiExample')}</p>
                  </div>
                </div>

                <form className={styles.aiAssistantForm} onSubmit={handleAssistantSubmit}>
                  <input
                    className={`input ${styles.aiAssistantInput}`}
                    value={assistantInput}
                    onChange={e => setAssistantInput(e.target.value)}
                    placeholder={t('shop.aiPlaceholder')}
                    aria-label="AI stylist prompt"
                  />
                  <button type="submit" className={styles.aiAssistantButton}>
                    {t('shop.aiSubmit')}
                  </button>
                </form>

                <div className={styles.aiAssistantResult}>
                  {assistantLoading ? (
                    <p className={styles.aiAssistantHint}>{t('shop.aiThinking')}</p>
                  ) : assistantResult ? (
                    <>
                      <p className={styles.aiAssistantResultTitle}>«{assistantResult.prompt}»</p>
                      <p className={styles.aiAssistantNote}>{assistantResult.note}</p>
                      <div className={styles.aiAssistantList}>
                        {assistantResult.items.map(item => (
                          <div key={item._id} className={styles.aiAssistantItem}>
                            <img
                              src={item.image}
                              alt={item.name}
                              loading="lazy"
                              className={styles.aiAssistantItemImage}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = 'https://via.placeholder.com/120x120?text=No+image';
                              }}
                            />
                            <div>
                              <h3 className={styles.aiAssistantItemName}>{item.name}</h3>
                              <p className={styles.aiAssistantItemPrice}>${item.price}</p>
                              <p className={styles.aiAssistantItemMeta}>{t('shop.aiItemMeta')}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className={styles.aiAssistantHint}>{t('shop.aiDefaultHint')}</p>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* Stats */}
          <div className={styles.statsRow}>
            {STATS.map(s => (
              <div key={s.value} className={styles.stat}>
                <span className={styles.statValue}>{s.value}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured strip (only when no filters active) ── */}
      {showFeatured && (
        <section className={styles.featured} aria-label="Featured products">
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>{t('shop.featured')}</h2>
              <div className={styles.sectionLine} />
            </div>
            <div className={styles.featuredGrid}>
              {featured.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── Catalog ── */}
      <section className={styles.catalog} id="catalog">
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('shop.catalog')}</h2>
            <div className={styles.sectionLine} />
          </div>

          {/* Toolbar */}
          <div className={styles.toolbar}>
            <form onSubmit={handleSearch} className={styles.searchForm}>
              <SearchIcon className={styles.searchIcon} />
              <input
                className={`input ${styles.searchInput}`}
                placeholder={t('shop.searchPlaceholder')}
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label={t('shop.searchPlaceholder')}
              />
              {search && (
                <button
                  type="button"
                  className={styles.clearBtn}
                  onClick={() => { setSearch(''); setQuery(''); }}
                  aria-label={t('shop.clearSearchAria')}
                >×</button>
              )}
            </form>

            <select
              className={`input ${styles.sortSelect}`}
              value={sort}
              onChange={e => setSort(e.target.value)}
              aria-label={t('shop.sortAria')}
            >
              {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          {/* Category filters */}
          <div className={styles.filters} role="group" aria-label={t('shop.categoryFilterAria')}>
            {CATS.map(c => (
              <button
                key={c.value}
                className={`${styles.filter} ${category === c.value ? styles.filterActive : ''}`}
                onClick={() => setCategory(c.value)}
                aria-pressed={category === c.value}
              >{c.label}</button>
            ))}
          </div>

          {/* Results count */}
          {!loading && !error && products.length > 0 && (
            <p className={styles.resultsCount}>
              {products.length} {t('shop.product', { count: products.length })}
              {query && <> {t('shop.resultsFor', { query })}</>}
            </p>
          )}

          {/* States */}
          {error && (
            <div className={styles.state}>
              <span className={styles.stateIcon}>⚠</span>
              <p style={{ color: 'var(--error)' }}>{error}</p>
              <p className={styles.stateHint}>
                {t('shop.startBackendHint')} <code>cd backend && npm run dev</code>
              </p>
            </div>
          )}

                  {loading && (
                    <div className={styles.grid}>
                      {Array(LIMIT).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)}
                    </div>
                  )}

          {!loading && !error && products.length === 0 && (
            <div className={styles.state}>
              <span className={styles.stateIcon}>🔍</span>
              <p>{t('shop.noProducts')}</p>
              {query
                ? <button className={styles.stateAction} onClick={() => { setSearch(''); setQuery(''); }}>{t('shop.resetSearch')}</button>
                : <p className={styles.stateHint}>{t('shop.seedHint')} <code>node src/seed.js</code></p>
              }
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <>
              <div className={`${styles.grid} ${category === 'clothing' ? styles.gridDense : ''}`}>
                {products.map(p => <ProductCard key={p._id} product={p} />)}
              </div>
              {page < pages && (
                <div style={{ textAlign: 'center', marginTop: 20 }}>
                  <button className="btn btn-ghost" onClick={loadMore} disabled={loadingMore}>
                    {loadingMore ? t('shop.loadingMore') : t('shop.loadMore')}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function SearchIcon({ className }) {
  return (
    <svg className={className} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}

function ArrowDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
    </svg>
  );
}
