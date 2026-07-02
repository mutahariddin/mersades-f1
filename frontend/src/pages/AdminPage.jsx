import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api';
import styles from './AdminPage.module.css';

const STATUS_COLORS = {
  pending: '#f59e0b',
  paid: '#22c55e',
  confirmed: '#00d2be',
  shipped: '#3b82f6',
  delivered: '#22c55e',
  cancelled: '#ef4444',
};

const STATUSES = ['pending', 'paid', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const EMPTY_PRODUCT = {
  name: '',
  nameRu: '',
  price: '',
  costPrice: '',
  logisticsCost: '',
  stock: '',
  minStock: '3',
  sku: '',
  supplier: '',
  warehouseLocation: '',
  category: 'clothing',
  image: '',
  description: '',
  descriptionRu: '',
  sizes: '',
  badge: '',
  inStock: true,
};

const currency = (value) => `$${Number(value || 0).toFixed(2)}`;

export default function AdminPage() {
  const { user, loading } = useAuth();
  const { t, localize } = useLanguage();
  const navigate = useNavigate();
  const { show } = useToast();

  const [tab, setTab] = useState('orders');
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const [modal, setModal] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loading) return; // wait for auth to resolve
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'admin') {
      navigate('/');
      return;
    }
    loadStats();
  }, [user, loading, navigate]);

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== 'admin') return;

    if (tab === 'orders') loadOrders();
    if (['products', 'warehouse', 'finance'].includes(tab)) loadProducts();
  }, [tab, statusFilter, user, loading]);

  const filteredProducts = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return products;
    return products.filter((p) =>
      [p.name, p.nameRu, p.sku, p.supplier, p.warehouseLocation]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(value))
    );
  }, [products, search]);

  const localFinance = useMemo(() => {
    return products.reduce(
      (acc, p) => {
        const stock = Number(p.stock || 0);
        const cost = Number(p.costPrice || 0);
        const logistics = Number(p.logisticsCost || 0);
        const price = Number(p.price || 0);
        acc.stockUnits += stock;
        acc.stockCost += stock * (cost + logistics);
        acc.stockValue += stock * price;
        acc.lowStock += stock <= Number(p.minStock ?? 3) ? 1 : 0;
        return acc;
      },
      { stockUnits: 0, stockCost: 0, stockValue: 0, lowStock: 0 }
    );
  }, [products]);

  const loadStats = async () => {
    setStatsLoading(true);
    try {
      setStats(await api.adminStats());
    } catch (e) {
      show(e.message, 'error');
    } finally {
      setStatsLoading(false);
    }
  };

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const data = await api.adminOrders(statusFilter ? { status: statusFilter } : {});
      setOrders(Array.isArray(data) ? data : data.orders || []);
    } catch (e) {
      show(e.message, 'error');
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const data = await api.getProducts({ limit: 200 });
      setProducts(Array.isArray(data) ? data : []);
    } catch (e) {
      show(e.message, 'error');
    } finally {
      setLoadingProducts(false);
    }
  };

  const refreshAdminData = () => {
    loadStats();
    if (['products', 'warehouse', 'finance'].includes(tab)) loadProducts();
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.adminUpdateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)));
      show(t('admin.toast.orderStatusUpdated'));
      loadStats();
    } catch (e) {
      show(e.message, 'error');
    }
  };

  const openAdd = () => {
    setForm(EMPTY_PRODUCT);
    setEditProduct(null);
    setModal('add');
  };

  const openEdit = (p) => {
    setForm({
      name: p.name || '',
      nameRu: p.nameRu || '',
      price: p.price ?? '',
      costPrice: p.costPrice ?? '',
      logisticsCost: p.logisticsCost ?? '',
      stock: p.stock ?? '',
      minStock: p.minStock ?? '3',
      sku: p.sku || '',
      supplier: p.supplier || '',
      warehouseLocation: p.warehouseLocation || '',
      category: p.category || 'clothing',
      image: p.image || '',
      description: p.description || '',
      descriptionRu: p.descriptionRu || '',
      sizes: (p.sizes || []).join(', '),
      badge: p.badge || '',
      inStock: p.inStock !== false,
    });
    setEditProduct(p);
    setModal('edit');
  };

  const closeModal = () => {
    setModal(null);
    setEditProduct(null);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const productBody = () => ({
    ...form,
    price: Number(form.price || 0),
    costPrice: Number(form.costPrice || 0),
    logisticsCost: Number(form.logisticsCost || 0),
    stock: Number(form.stock || 0),
    minStock: Number(form.minStock || 0),
    sizes: form.sizes ? form.sizes.split(',').map((s) => s.trim()).filter(Boolean) : [],
    inStock: form.inStock && Number(form.stock || 0) > 0,
  });

  const handleSave = async () => {
    if (!form.name || !form.price || !form.image) {
      show(t('admin.requiredFieldsError'), 'error');
      return;
    }
    setSaving(true);
    try {
      if (modal === 'add') {
        const p = await api.adminCreateProduct(productBody());
        setProducts((prev) => [p, ...prev]);
        show(t('admin.toast.productAdded'));
      } else {
        const p = await api.adminUpdateProduct(editProduct._id, productBody());
        setProducts((prev) => prev.map((x) => (x._id === p._id ? p : x)));
        show(t('admin.toast.productUpdated'));
      }
      closeModal();
      refreshAdminData();
    } catch (e) {
      show(e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(t('admin.confirmDelete', { name }))) return;
    try {
      await api.adminDeleteProduct(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      show(t('admin.toast.productDeleted'));
      loadStats();
    } catch (e) {
      show(e.message, 'error');
    }
  };

  const handleToggleStock = async (p) => {
    try {
      const next = !p.inStock;
      const updated = await api.adminUpdateProduct(p._id, {
        inStock: next,
        stock: next && Number(p.stock || 0) === 0 ? 1 : p.stock,
      });
      setProducts((prev) => prev.map((x) => (x._id === updated._id ? updated : x)));
      show(next ? t('admin.toast.backInStock') : t('admin.toast.removedFromStock'));
      loadStats();
    } catch (e) {
      show(e.message, 'error');
    }
  };

  const updateWarehouseField = (id, field, value) => {
    setProducts((prev) => prev.map((p) => (p._id === id ? { ...p, [field]: value } : p)));
  };

  const saveWarehouseRow = async (p) => {
    try {
      const updated = await api.adminUpdateProduct(p._id, {
        stock: Number(p.stock || 0),
        minStock: Number(p.minStock || 0),
        costPrice: Number(p.costPrice || 0),
        logisticsCost: Number(p.logisticsCost || 0),
        warehouseLocation: p.warehouseLocation || '',
        supplier: p.supplier || '',
        inStock: Number(p.stock || 0) > 0 && p.inStock !== false,
      });
      setProducts((prev) => prev.map((x) => (x._id === updated._id ? updated : x)));
      show(t('admin.toast.warehouseSaved'));
      loadStats();
    } catch (e) {
      show(e.message, 'error');
    }
  };

  if (loading) return null;
  if (!user || user.role !== 'admin') return null;

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <div>
            <p className={styles.eyebrow}>{t('admin.eyebrow')}</p>
            <h1 className={styles.title}>{t('admin.title')}</h1>
          </div>
          <button className="btn btn-teal" onClick={openAdd}>{t('admin.addProduct')}</button>
        </div>

        {!statsLoading && (
          <div className={styles.statsGrid}>
            <StatCard label={t('admin.stat.revenue')} value={currency(stats?.revenue)} accent />
            <StatCard label={t('admin.stat.expenses')} value={currency(stats?.expenses)} />
            <StatCard label={t('admin.stat.profit')} value={currency(stats?.profit)} accent={(stats?.profit || 0) >= 0} />
            <StatCard label={t('admin.stat.stockValue')} value={currency(stats?.stockCost ?? localFinance.stockCost)} />
            <StatCard label={t('admin.stat.orders')} value={stats?.totalOrders || 0} />
            <StatCard label={t('admin.stat.products')} value={stats?.totalProducts || products.length} />
            <StatCard label={t('admin.stat.stockUnits')} value={stats?.stockUnits ?? localFinance.stockUnits} />
            <StatCard label={t('admin.stat.lowStock')} value={stats?.lowStock ?? localFinance.lowStock} danger={(stats?.lowStock ?? localFinance.lowStock) > 0} />
          </div>
        )}

        <div className={styles.tabs}>
          {[
            ['orders', t('admin.tab.orders')],
            ['products', t('admin.tab.products')],
            ['warehouse', t('admin.tab.warehouse')],
            ['finance', t('admin.tab.finance')],
          ].map(([key, label]) => (
            <button
              key={key}
              className={`${styles.tab} ${tab === key ? styles.tabActive : ''}`}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'orders' && (
          <OrdersTab
            orders={orders}
            loading={loadingOrders}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onStatusChange={handleStatusChange}
          />
        )}

        {tab === 'products' && (
          <ProductsTab
            products={filteredProducts}
            loading={loadingProducts}
            search={search}
            setSearch={setSearch}
            openAdd={openAdd}
            openEdit={openEdit}
            onDelete={handleDelete}
            onToggleStock={handleToggleStock}
          />
        )}

        {tab === 'warehouse' && (
          <WarehouseTab
            products={filteredProducts}
            loading={loadingProducts}
            search={search}
            setSearch={setSearch}
            updateField={updateWarehouseField}
            saveRow={saveWarehouseRow}
          />
        )}

        {tab === 'finance' && (
          <FinanceTab stats={stats} localFinance={localFinance} products={filteredProducts} loading={loadingProducts} />
        )}
      </div>

      {modal && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{modal === 'add' ? t('admin.modal.addTitle') : t('admin.modal.editTitle')}</h2>
              <button className={styles.modalClose} onClick={closeModal}>x</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <Field label={t('admin.modal.nameRequired')}>
                  <input className="input" name="name" value={form.name} onChange={handleFormChange} placeholder="Team Hoodie" />
                </Field>
                <Field label={t('admin.modal.nameRu')}>
                  <input className="input" name="nameRu" value={form.nameRu} onChange={handleFormChange} placeholder="Team Hoodie" />
                </Field>
                <Field label={t('admin.modal.priceRequired')}>
                  <input className="input" name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleFormChange} />
                </Field>
                <Field label={t('admin.modal.costPrice')}>
                  <input className="input" name="costPrice" type="number" min="0" step="0.01" value={form.costPrice} onChange={handleFormChange} />
                </Field>
                <Field label={t('admin.modal.logisticsCost')}>
                  <input className="input" name="logisticsCost" type="number" min="0" step="0.01" value={form.logisticsCost} onChange={handleFormChange} />
                </Field>
                <Field label={t('admin.modal.stock')}>
                  <input className="input" name="stock" type="number" min="0" value={form.stock} onChange={handleFormChange} />
                </Field>
                <Field label={t('admin.modal.minStock')}>
                  <input className="input" name="minStock" type="number" min="0" value={form.minStock} onChange={handleFormChange} />
                </Field>
                <Field label={t('admin.modal.category')}>
                  <select className="input" name="category" value={form.category} onChange={handleFormChange}>
                    <option value="clothing">{t('admin.modal.catClothing')}</option>
                    <option value="accessories">{t('admin.modal.catAccessories')}</option>
                    <option value="collectibles">{t('admin.modal.catCollectibles')}</option>
                  </select>
                </Field>
                <Field label={t('admin.modal.sku')}>
                  <input className="input" name="sku" value={form.sku} onChange={handleFormChange} placeholder="MERC-HOOD-001" />
                </Field>
                <Field label={t('admin.modal.supplier')}>
                  <input className="input" name="supplier" value={form.supplier} onChange={handleFormChange} placeholder="Supplier" />
                </Field>
              </div>

              <Field label={t('admin.modal.warehouseLocation')}>
                <input className="input" name="warehouseLocation" value={form.warehouseLocation} onChange={handleFormChange} placeholder="A-12 / Toshkent" />
              </Field>
              <Field label={t('admin.modal.imageUrl')}>
                <input className="input" name="image" value={form.image} onChange={handleFormChange} placeholder="https://..." />
              </Field>
              {form.image && (
                <div className={styles.imgPreview}>
                  <img src={form.image} alt="preview" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                </div>
              )}
              <div className={styles.formGrid}>
                <Field label={t('admin.modal.sizes')}>
                  <input className="input" name="sizes" value={form.sizes} onChange={handleFormChange} placeholder="XS, S, M, L, XL" />
                </Field>
                <Field label={t('admin.modal.badge')}>
                  <input className="input" name="badge" value={form.badge} onChange={handleFormChange} placeholder="NEW / SALE" />
                </Field>
              </div>
              <Field label={t('admin.modal.description')}>
                <textarea className="input" name="descriptionRu" value={form.descriptionRu} onChange={handleFormChange} rows={3} />
              </Field>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" name="inStock" checked={form.inStock} onChange={handleFormChange} />
                <span>{t('admin.modal.showInStock')}</span>
              </label>
            </div>
            <div className={styles.modalFooter}>
              <button className="btn btn-ghost" onClick={closeModal}>{t('common.cancel')}</button>
              <button className="btn btn-teal" onClick={handleSave} disabled={saving}>
                {saving ? t('common.saving') : t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function OrdersTab({ orders, loading, statusFilter, setStatusFilter, onStatusChange }) {
  const { t, localize } = useLanguage();
  const STATUS_LABELS = t('account.status');
  return (
    <div>
      <div className={styles.filters}>
        <button className={`${styles.filter} ${statusFilter === '' ? styles.filterActive : ''}`} onClick={() => setStatusFilter('')}>{t('admin.all')}</button>
        {STATUSES.map((s) => (
          <button
            key={s}
            className={`${styles.filter} ${statusFilter === s ? styles.filterActive : ''}`}
            onClick={() => setStatusFilter(s)}
            style={statusFilter === s ? { borderColor: STATUS_COLORS[s], color: STATUS_COLORS[s], background: `${STATUS_COLORS[s]}18` } : {}}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <div className={styles.table}>
        <div className={styles.tableHeader}>
          <span>{t('admin.table.order')}</span><span>{t('admin.table.customer')}</span><span>{t('admin.table.item')}</span><span>{t('admin.table.total')}</span><span>{t('admin.table.status')}</span><span>{t('admin.table.date')}</span>
        </div>
        {loading && <div className={styles.tableEmpty}><div className="spinner" /></div>}
        {!loading && orders.length === 0 && <div className={styles.tableEmpty}>{t('admin.noOrders')}</div>}
        {orders.map((order) => (
          <div key={order._id} className={styles.tableRow}>
            <span className={styles.orderId}>#{order._id.slice(-8).toUpperCase()}</span>
            <div className={styles.customer}>
              <p>{order.customer?.name || order.user?.name || '-'}</p>
              <p className={styles.customerEmail}>{order.customer?.email || order.user?.email || ''}</p>
            </div>
            <span className={styles.itemsCount}>{order.items?.length || 0} {t('admin.positions')}</span>
            <span className={styles.total}>{currency(order.total)}</span>
            <div>
              <select
                className={styles.statusSelect}
                value={order.status}
                onChange={(e) => onStatusChange(order._id, e.target.value)}
                style={{ color: STATUS_COLORS[order.status], borderColor: STATUS_COLORS[order.status] }}
              >
                {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>
            <span className={styles.date}>
              {new Date(order.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductsTab({ products, loading, search, setSearch, openAdd, openEdit, onDelete, onToggleStock }) {
  const { t, localize } = useLanguage();
  return (
    <div>
      <div className={styles.productsToolbar}>
        <input className={`input ${styles.searchInput}`} value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('admin.searchProducts')} />
        <button className="btn btn-teal" onClick={openAdd}>{t('admin.addProduct')}</button>
      </div>

      <div className={styles.productsGrid}>
        {loading && [1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className={`${styles.productAdminCard} skeleton`} style={{ height: 260 }} />
        ))}
        {!loading && products.map((p) => (
          <div key={p._id} className={styles.productAdminCard}>
            <div className={styles.productAdminImg}>
              <img src={p.image} alt={localize(p, 'name', 'nameRu')} />
              <button
                className={`${styles.stockBadge} ${p.inStock ? styles.stockIn : styles.stockOut}`}
                onClick={() => onToggleStock(p)}
                title={t('admin.toggleStockTitle')}
              >
                {p.inStock ? t('admin.inStockBadge') : t('admin.outOfStockBadge')}
              </button>
            </div>
            <div className={styles.productAdminBody}>
              <p className={styles.productAdminName}>{localize(p, 'name', 'nameRu')}</p>
              <p className={styles.productMeta}>{p.sku || t('admin.noSku')} / {p.stock || 0}</p>
              <p className={styles.productAdminPrice}>{currency(p.price)}</p>
            </div>
            <div className={styles.productAdminActions}>
              <button className={styles.editBtn} onClick={() => openEdit(p)}>{t('admin.editBtn')}</button>
              <button className={styles.deleteBtn} onClick={() => onDelete(p._id, localize(p, 'name', 'nameRu'))}>{t('admin.deleteBtn')}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WarehouseTab({ products, loading, search, setSearch, updateField, saveRow }) {
  const { t, localize } = useLanguage();
  return (
    <div>
      <div className={styles.productsToolbar}>
        <input className={`input ${styles.searchInput}`} value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('admin.searchWarehouse')} />
        <p className={styles.sectionNote}>{products.length} {t('admin.positionsCount')}</p>
      </div>

      <div className={styles.warehouseTable}>
        <div className={styles.warehouseHeader}>
          <span>{t('admin.warehouseTable.item')}</span><span>{t('admin.warehouseTable.qty')}</span><span>{t('admin.warehouseTable.min')}</span><span>{t('admin.warehouseTable.cost')}</span><span>{t('admin.warehouseTable.logistics')}</span><span>{t('admin.warehouseTable.location')}</span><span></span>
        </div>
        {loading && <div className={styles.tableEmpty}><div className="spinner" /></div>}
        {!loading && products.map((p) => (
          <div key={p._id} className={`${styles.warehouseRow} ${Number(p.stock || 0) <= Number(p.minStock ?? 3) ? styles.lowStockRow : ''}`}>
            <div>
              <p className={styles.productAdminName}>{localize(p, 'name', 'nameRu')}</p>
              <p className={styles.productMeta}>{p.sku || t('admin.noSku')} / {p.supplier || t('admin.noSupplier')}</p>
            </div>
            <input className="input" type="number" min="0" value={p.stock ?? ''} onChange={(e) => updateField(p._id, 'stock', e.target.value)} />
            <input className="input" type="number" min="0" value={p.minStock ?? ''} onChange={(e) => updateField(p._id, 'minStock', e.target.value)} />
            <input className="input" type="number" min="0" step="0.01" value={p.costPrice ?? ''} onChange={(e) => updateField(p._id, 'costPrice', e.target.value)} />
            <input className="input" type="number" min="0" step="0.01" value={p.logisticsCost ?? ''} onChange={(e) => updateField(p._id, 'logisticsCost', e.target.value)} />
            <input className="input" value={p.warehouseLocation || ''} onChange={(e) => updateField(p._id, 'warehouseLocation', e.target.value)} placeholder="A-12" />
            <button className={styles.editBtn} onClick={() => saveRow(p)}>{t('common.save')}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function FinanceTab({ stats, localFinance, products, loading }) {
  const { t, localize } = useLanguage();
  const revenue = stats?.revenue || 0;
  const expenses = stats?.expenses || 0;
  const profit = stats?.profit || 0;

  return (
    <div className={styles.financeGrid}>
      <div className={styles.financePanel}>
        <h2>{t('admin.finance.revenueExpenses')}</h2>
        <div className={styles.financeRows}>
          <FinanceRow label={t('admin.finance.totalRevenue')} value={currency(revenue)} />
          <FinanceRow label={t('admin.finance.cogsLogistics')} value={currency(expenses)} />
          <FinanceRow label={t('admin.finance.estProfit')} value={currency(profit)} strong good={profit >= 0} />
        </div>
      </div>

      <div className={styles.financePanel}>
        <h2>{t('admin.finance.stockCapital')}</h2>
        <div className={styles.financeRows}>
          <FinanceRow label={t('admin.finance.stockUnits')} value={stats?.stockUnits ?? localFinance.stockUnits} />
          <FinanceRow label={t('admin.finance.stockCost')} value={currency(stats?.stockCost ?? localFinance.stockCost)} />
          <FinanceRow label={t('admin.finance.stockValue')} value={currency(stats?.stockValue ?? localFinance.stockValue)} />
          <FinanceRow label={t('admin.finance.lowStockItems')} value={stats?.lowStock ?? localFinance.lowStock} strong />
        </div>
      </div>

      <div className={`${styles.financePanel} ${styles.financeWide}`}>
        <h2>{t('admin.finance.marginTitle')}</h2>
        {loading && <div className={styles.tableEmpty}><div className="spinner" /></div>}
        {!loading && products.map((p) => {
          const unitCost = Number(p.costPrice || 0) + Number(p.logisticsCost || 0);
          const margin = Number(p.price || 0) - unitCost;
          return (
            <div key={p._id} className={styles.marginRow}>
              <span>{localize(p, 'name', 'nameRu')}</span>
              <span>{t('admin.finance.sale')}: {currency(p.price)}</span>
              <span>{t('admin.finance.cost')}: {currency(unitCost)}</span>
              <strong className={margin >= 0 ? styles.goodText : styles.badText}>{currency(margin)}</strong>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FinanceRow({ label, value, strong, good }) {
  return (
    <div className={styles.financeRow}>
      <span>{label}</span>
      <strong className={strong ? (good === false ? styles.badText : styles.goodText) : ''}>{value}</strong>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>{label}</label>
      {children}
    </div>
  );
}

function StatCard({ label, value, accent, danger }) {
  return (
    <div className={`${styles.statCard} ${accent ? styles.statCardAccent : ''} ${danger ? styles.statCardDanger : ''}`}>
      <div>
        <p className={styles.statValue}>{value}</p>
        <p className={styles.statLabel}>{label}</p>
      </div>
    </div>
  );
}
