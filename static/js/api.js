// API configuration
const API_BASE = '/api';

// API utility functions
class API {
    static async request(endpoint, options = {}) {
        const url = `${API_BASE}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        if (config.body && typeof config.body !== 'string') {
            config.body = JSON.stringify(config.body);
        }

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API request failed: ${endpoint}`, error);
            throw error;
        }
    }

    // Parts API
    static async getParts(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/parts?${queryString}` : '/parts';
        return this.request(endpoint);
    }

    static async getPart(id) {
        return this.request(`/parts/${id}`);
    }

    static async createPart(data) {
        return this.request('/parts', {
            method: 'POST',
            body: data,
        });
    }

    static async updatePart(id, data) {
        return this.request(`/parts/${id}`, {
            method: 'PUT',
            body: data,
        });
    }

    static async deletePart(id) {
        return this.request(`/parts/${id}`, {
            method: 'DELETE',
        });
    }

    // Bins API
    static async getBins() {
        return this.request('/bins');
    }

    static async getBin(id) {
        return this.request(`/bins/${id}`);
    }

    static async createBin(data) {
        return this.request('/bins', {
            method: 'POST',
            body: data,
        });
    }

    static async updateBin(id, data) {
        return this.request(`/bins/${id}`, {
            method: 'PUT',
            body: data,
        });
    }

    static async deleteBin(id) {
        return this.request(`/bins/${id}`, {
            method: 'DELETE',
        });
    }

    // Categories API
    static async getCategories() {
        return this.request('/categories');
    }

    static async getCategory(id) {
        return this.request(`/categories/${id}`);
    }

    static async createCategory(data) {
        return this.request('/categories', {
            method: 'POST',
            body: data,
        });
    }

    static async updateCategory(id, data) {
        return this.request(`/categories/${id}`, {
            method: 'PUT',
            body: data,
        });
    }

    static async deleteCategory(id) {
        return this.request(`/categories/${id}`, {
            method: 'DELETE',
        });
    }
}