// services/api.js
import { authService } from "./authService";

// API Base Configuration
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:3001/api";
const API_TIMEOUT = 30000; // 30 seconds

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// Custom API Error Class
class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// Request interceptor to add auth token
const addAuthHeader = (config) => {
  const token = authService.getToken();
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
};

// Response interceptor for error handling
const handleResponseError = async (error) => {
  const { response, request } = error;

  if (response) {
    // Server responded with error status
    const { status, data } = response;

    switch (status) {
      case HTTP_STATUS.UNAUTHORIZED:
        // Try to refresh token
        try {
          await authService.refreshToken();
          // Retry the original request
          return api.request(error.config);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          authService.logout();
          window.location.href = "/login";
          throw new ApiError("Authentication failed", status, data);
        }

      case HTTP_STATUS.FORBIDDEN:
        throw new ApiError("Access forbidden", status, data);

      case HTTP_STATUS.NOT_FOUND:
        throw new ApiError("Resource not found", status, data);

      case HTTP_STATUS.CONFLICT:
        throw new ApiError("Resource conflict", status, data);

      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        throw new ApiError("Internal server error", status, data);

      case HTTP_STATUS.SERVICE_UNAVAILABLE:
        throw new ApiError("Service unavailable", status, data);

      default:
        throw new ApiError(data?.message || "Request failed", status, data);
    }
  } else if (request) {
    // Request was made but no response received
    throw new ApiError("Network error - no response received", 0, null);
  } else {
    // Something else happened
    throw new ApiError("Request setup error", 0, null);
  }
};

// Main API class
class API {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.timeout = API_TIMEOUT;
  }

  async request(config) {
    // Add default config
    const defaultConfig = {
      timeout: this.timeout,
      headers: {
        "Content-Type": "application/json",
        ...config.headers,
      },
    };

    // Merge configs
    const finalConfig = { ...defaultConfig, ...config };

    // Add auth header
    addAuthHeader(finalConfig);

    // Build full URL
    const url = finalConfig.url.startsWith("http")
      ? finalConfig.url
      : `${this.baseURL}${finalConfig.url}`;

    try {
      // Simulate fetch API behavior
      const response = await this.mockFetch(url, finalConfig);
      return response;
    } catch (error) {
      return handleResponseError(error);
    }
  }

  // Mock fetch for development (replace with real fetch in production)
  async mockFetch(url, config) {
    // Simulate network delay
    await new Promise((resolve) =>
      setTimeout(resolve, 500 + Math.random() * 1000)
    );

    // Mock responses based on URL patterns
    if (url.includes("/auth/login")) {
      return {
        data: { token: "mock_token", user: { id: 1, name: "Dr. Test" } },
      };
    }

    if (url.includes("/patients")) {
      return { data: [] }; // Will use patientService mock data
    }

    if (url.includes("/dicom")) {
      return { data: {} }; // Will use dicomService mock data
    }

    // Default successful response
    return { data: { success: true } };
  }

  // HTTP Methods
  async get(url, config = {}) {
    return this.request({
      method: "GET",
      url,
      ...config,
    });
  }

  async post(url, data = null, config = {}) {
    return this.request({
      method: "POST",
      url,
      data,
      ...config,
    });
  }

  async put(url, data = null, config = {}) {
    return this.request({
      method: "PUT",
      url,
      data,
      ...config,
    });
  }

  async patch(url, data = null, config = {}) {
    return this.request({
      method: "PATCH",
      url,
      data,
      ...config,
    });
  }

  async delete(url, config = {}) {
    return this.request({
      method: "DELETE",
      url,
      ...config,
    });
  }

  // File upload helper
  async upload(url, formData, config = {}) {
    return this.request({
      method: "POST",
      url,
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
        ...config.headers,
      },
      ...config,
    });
  }

  // Download helper
  async download(url, config = {}) {
    return this.request({
      method: "GET",
      url,
      responseType: "blob",
      ...config,
    });
  }
}

// Create API instance
export const api = new API();

// Export error class and constants
export { ApiError, HTTP_STATUS };

// Utility functions
export const apiUtils = {
  // Build query string from params object
  buildQueryString: (params) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        searchParams.append(key, value);
      }
    });
    return searchParams.toString();
  },

  // Handle file download
  downloadFile: (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Format file size
  formatFileSize: (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  },

  // Check if response is successful
  isSuccessResponse: (status) => {
    return status >= 200 && status < 300;
  },

  // Retry failed requests
  retry: async (fn, maxAttempts = 3, delay = 1000) => {
    let lastError;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        if (attempt === maxAttempts) {
          throw lastError;
        }

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
      }
    }
  },
};
