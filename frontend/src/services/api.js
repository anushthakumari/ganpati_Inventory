const API_BASE_URL = 'http://localhost:5000/api';

// Toggle this to switch between Mock and Live
const IS_MOCK = false; 

const mockData = {
  products: [
    { id: 1, name: 'Premium Ceramic Tiles 2x2', category: 'Tiles', brand: 'Kajaria', price: 850, stock: 450, shop: 'Shop 1' },
    { id: 2, name: 'Asian Paints Apex 20L', category: 'Paints', brand: 'Asian Paints', price: 3200, stock: 32, shop: 'Shop 1 & 2' },
    { id: 3, name: 'Hindware Wash Basin', category: 'Sanitaryware', brand: 'Hindware', price: 1500, stock: 15, shop: 'Shop 2' },
    { id: 4, name: 'Italian Marble Slab', category: 'Marble', brand: 'Imported', price: 5500, stock: 120, shop: 'Shop 1' },
    { id: 5, name: 'Berger Easy Clean 10L', category: 'Paints', brand: 'Berger', price: 1800, stock: 45, shop: 'Shop 2' },
  ]
};

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const api = {
  auth: {
    login: async (email, password) => {
      if (IS_MOCK) return { token: 'mock-token', user: { username: 'Admin', role: 'admin' } };
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) throw new Error('Login failed');
      return res.json();
    }
  },
  products: {
    getAll: async () => {
      if (IS_MOCK) return mockData.products;
      try {
        const response = await fetch(`${API_BASE_URL}/products`, { headers: getHeaders() });
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.map(p => ({
          ...p,
          id: p._id || p.id,
          price: p.sellingPrice || p.price,
          stock: (p.stockShop1 || 0) + (p.stockShop2 || 0),
          shop: (p.stockShop1 > 0 && p.stockShop2 > 0) ? 'Shop 1 & 2' : (p.stockShop1 > 0 ? 'Shop 1' : 'Shop 2')
        }));
      } catch (error) {
        console.error('Fetch products error:', error);
        return mockData.products;
      }
    },
    add: async (productData) => {
      if (IS_MOCK) return { ...productData, id: Date.now() };
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(productData),
      });
      return await response.json();
    },
    update: async (id, productData) => {
      if (IS_MOCK) return { ...productData, id };
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(productData),
      });
      return await response.json();
    },
    delete: async (id) => {
      if (IS_MOCK) return true;
      const response = await fetch(`${API_BASE_URL}/products/${id}`, { 
        method: 'DELETE',
        headers: getHeaders()
      });
      return await response.json();
    }
  },
  customers: {
    getAll: async () => {
      if (IS_MOCK) return [];
      const response = await fetch(`${API_BASE_URL}/customers`, { headers: getHeaders() });
      const data = await response.json();
      return data.map(c => ({ ...c, id: c._id }));
    },
    add: async (customerData) => {
      if (IS_MOCK) return { ...customerData, id: Date.now() };
      const response = await fetch(`${API_BASE_URL}/customers`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(customerData),
      });
      return await response.json();
    },
    update: async (id, customerData) => {
      if (IS_MOCK) return { ...customerData, id };
      const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(customerData),
      });
      return await response.json();
    },
    delete: async (id) => {
      if (IS_MOCK) return true;
      const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return await response.json();
    }
  },
  suppliers: {
    getAll: async () => {
      if (IS_MOCK) return [];
      const response = await fetch(`${API_BASE_URL}/suppliers`, { headers: getHeaders() });
      const data = await response.json();
      return data.map(s => ({ ...s, id: s._id }));
    },
    add: async (supplierData) => {
      if (IS_MOCK) return { ...supplierData, id: Date.now() };
      const response = await fetch(`${API_BASE_URL}/suppliers`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(supplierData),
      });
      return await response.json();
    },
    update: async (id, supplierData) => {
      if (IS_MOCK) return { ...supplierData, id };
      const response = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(supplierData),
      });
      return await response.json();
    },
    delete: async (id) => {
      if (IS_MOCK) return true;
      const response = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return await response.json();
    }
  },
  invoices: {
    getAll: async () => {
      if (IS_MOCK) return [];
      const response = await fetch(`${API_BASE_URL}/invoices`, { headers: getHeaders() });
      const data = await response.json();
      return data.map(i => ({ ...i, id: i._id }));
    },
    create: async (invoiceData) => {
      if (IS_MOCK) return { ...invoiceData, id: Date.now() };
      const response = await fetch(`${API_BASE_URL}/invoices`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(invoiceData),
      });
      return await response.json();
    },
    update: async (id, invoiceData) => {
      if (IS_MOCK) return { ...invoiceData, id };
      const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(invoiceData),
      });
      return await response.json();
    },
    delete: async (id) => {
      if (IS_MOCK) return true;
      const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return await response.json();
    }
  },
  analytics: {
    getStats: async () => {
      if (IS_MOCK) return { totalRevenue: 145000, totalOrders: 154, lowStockCount: 12, netProfit: 42500 };
      const res = await fetch(`${API_BASE_URL}/analytics/stats`, { headers: getHeaders() });
      return res.json();
    },
    getSalesChart: async () => {
      if (IS_MOCK) return [
        { name: 'Mon', revenue: 4000 }, { name: 'Tue', revenue: 3000 },
        { name: 'Wed', revenue: 5500 }, { name: 'Thu', revenue: 4500 },
        { name: 'Fri', revenue: 6000 }, { name: 'Sat', revenue: 8000 },
        { name: 'Sun', revenue: 7500 }
      ];
      const res = await fetch(`${API_BASE_URL}/analytics/sales-chart`, { headers: getHeaders() });
      return res.json();
    },
    getTopProducts: async () => {
      if (IS_MOCK) return [
        { id: 1, name: 'Premium Ceramic Tiles 2x2', category: 'Tiles', sales: 124, stock: 450 },
        { id: 2, name: 'Asian Paints Apex 20L', category: 'Paints', sales: 85, stock: 32 }
      ];
      const res = await fetch(`${API_BASE_URL}/analytics/top-products`, { headers: getHeaders() });
      return res.json();
    },
    getCategoryReports: async () => {
      if (IS_MOCK) return [];
      const res = await fetch(`${API_BASE_URL}/analytics/category-reports`, { headers: getHeaders() });
      return res.json();
    }
  }
};

export default api;
