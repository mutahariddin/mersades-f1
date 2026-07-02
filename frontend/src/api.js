const BASE = import.meta.env.VITE_API_URL || '';

const headers = (extra = {}) => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
};

const handle = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка запроса');
  return data;
};

export const api = {
  // Auth
  register: (body) => fetch(`${BASE}/api/auth/register`, { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then(handle),
  login:    (body) => fetch(`${BASE}/api/auth/login`,    { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then(handle),
  me:       ()     => fetch(`${BASE}/api/auth/me`,       { headers: headers() }).then(handle),
  updateMe: (body) => fetch(`${BASE}/api/auth/me`,       { method: 'PUT', headers: headers(), body: JSON.stringify(body) }).then(handle),

  // Products — now returns { products, total, page, pages }
  getProducts: async (params = {}) => {
    const q = new URLSearchParams(params).toString();
    const data = await fetch(`${BASE}/api/products${q ? '?' + q : ''}`, { headers: headers() }).then(handle);
    // Support both old array format and new paginated format
    return Array.isArray(data) ? data : data.products;
  },
  // Returns full paginated response: { products, total, page, pages }
  getProductsFull: async (params = {}) => {
    const q = new URLSearchParams(params).toString();
    const data = await fetch(`${BASE}/api/products${q ? '?' + q : ''}`, { headers: headers() }).then(handle);
    return data;
  },
  getProduct: (id) => fetch(`${BASE}/api/products/${id}`, { headers: headers() }).then(handle),

  // Orders
  placeOrder: (body) => fetch(`${BASE}/api/orders`,    { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then(handle),
  myOrders:   ()     => fetch(`${BASE}/api/orders/my`, { headers: headers() }).then(handle),

  // Payment
  createPaymentIntent: (body) => fetch(`${BASE}/api/payment/create-intent`, { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then(handle),

  // Pilots
  getPilots: () => fetch(`${BASE}/api/pilots`, { headers: headers() }).then(handle),

  // AI
  aiRecommend: (body) => fetch(`${BASE}/api/ai/recommend`, { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then(handle),

  // Admin
  adminStats: () => fetch(`${BASE}/api/admin/stats`, { headers: headers() }).then(handle),
  adminOrders: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetch(`${BASE}/api/orders${q ? '?' + q : ''}`, { headers: headers() }).then(handle);
  },
  adminUpdateOrderStatus: (id, status) =>
    fetch(`${BASE}/api/orders/${id}/status`, { method: 'PATCH', headers: headers(), body: JSON.stringify({ status }) }).then(handle),
  adminCreateProduct: (body) =>
    fetch(`${BASE}/api/products`, { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then(handle),
  adminUpdateProduct: (id, body) =>
    fetch(`${BASE}/api/products/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(body) }).then(handle),
  adminDeleteProduct: (id) =>
    fetch(`${BASE}/api/products/${id}`, { method: 'DELETE', headers: headers() }).then(handle),
};
