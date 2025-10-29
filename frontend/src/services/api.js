const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://lost-found-production-d3ec.up.railway.app/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Search methods
  async searchByText(query, filters = {}) {
    return this.request('/search/text', {
      method: 'POST',
      body: JSON.stringify({
        query,
        ...filters,
        limit: 10
      }),
    });
  }

  async searchByImage(imageFile, filters = {}) {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    // Convert to base64 for the API
    const base64 = await this.fileToBase64(imageFile);
    
    return this.request('/search/image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageData: base64,
        ...filters,
        limit: 10
      }),
    });
  }

  async searchHybrid(query, imageFile, filters = {}) {
    const body = { ...filters, limit: 10 };
    
    if (query) {
      body.query = query;
    }
    
    if (imageFile) {
      body.imageData = await this.fileToBase64(imageFile);
    }

    return this.request('/search/hybrid', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // Item methods
  async getItems(page = 1, limit = 20, filters = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });

    return this.request(`/items?${params}`);
  }

  async getItem(id) {
    return this.request(`/items/${id}`);
  }

  async createItem(itemData) {
    return this.request('/items', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  }

  async updateItem(id, itemData) {
    return this.request(`/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(itemData),
    });
  }

  async deleteItem(id) {
    return this.request(`/items/${id}`, {
      method: 'DELETE',
    });
  }

  // Upload methods
  async uploadItem(formData) {
    const response = await fetch(`${API_BASE_URL}/upload/images`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Upload failed! status: ${response.status}`);
    }

    return await response.json();
  }

  async uploadSingleImage(imageFile, itemData) {
    const formData = new FormData();
    formData.append('image', imageFile);
    Object.keys(itemData).forEach(key => {
      formData.append(key, itemData[key]);
    });

    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Upload failed! status: ${response.status}`);
    }

    return await response.json();
  }

  // Utility methods
  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result.split(',')[1]; // Remove data:image/...;base64, prefix
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

// Create and export a singleton instance
const apiService = new ApiService();

// Export individual functions for easier use
export const searchItems = async (searchParams) => {
  const { type, query, imageFile, filters } = searchParams;
  
  switch (type) {
    case 'text':
      return apiService.searchByText(query, filters);
    case 'image':
      return apiService.searchByImage(imageFile, filters);
    case 'hybrid':
      return apiService.searchHybrid(query, imageFile, filters);
    default:
      throw new Error('Invalid search type');
  }
};

export const uploadItem = apiService.uploadItem.bind(apiService);
export const getItems = apiService.getItems.bind(apiService);
export const getItem = apiService.getItem.bind(apiService);
export const createItem = apiService.createItem.bind(apiService);
export const updateItem = apiService.updateItem.bind(apiService);
export const deleteItem = apiService.deleteItem.bind(apiService);
export const healthCheck = apiService.healthCheck.bind(apiService);

export default apiService;
