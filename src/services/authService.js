// services/authService.js
import { api } from "./api";

const TOKEN_KEY = "teleradiology_token";
const REFRESH_TOKEN_KEY = "teleradiology_refresh_token";
const USER_KEY = "teleradiology_user";

// Simulate API delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const authService = {
  // Login user
  login: async (credentials) => {
    await delay(1000); // Simulate network delay

    try {
      // In real implementation, this would be an API call
      // const response = await api.post('/auth/login', credentials);

      // Mock successful login
      if (credentials.email && credentials.password) {
        const mockUser = {
          id: "rad001",
          email: credentials.email,
          name: "Dr. Radiologist",
          role: "radiologist",
          department: "Radiology",
          license: "RAD123456",
          specialization: "General Radiology",
          avatar: null,
        };

        const mockTokens = {
          accessToken: "mock_access_token_" + Date.now(),
          refreshToken: "mock_refresh_token_" + Date.now(),
          expiresIn: 3600,
        };

        // Store in localStorage (in real app, consider more secure storage)
        localStorage.setItem(TOKEN_KEY, mockTokens.accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, mockTokens.refreshToken);
        localStorage.setItem(USER_KEY, JSON.stringify(mockUser));

        return {
          user: mockUser,
          tokens: mockTokens,
        };
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  },

  // Register new user
  register: async (userData) => {
    await delay(1500);

    try {
      // Mock registration
      const mockUser = {
        id: "rad" + Date.now(),
        email: userData.email,
        name: userData.name,
        role: userData.role || "radiologist",
        department: userData.department || "Radiology",
        license: userData.license,
        specialization: userData.specialization || "General Radiology",
        avatar: null,
      };

      const mockTokens = {
        accessToken: "mock_access_token_" + Date.now(),
        refreshToken: "mock_refresh_token_" + Date.now(),
        expiresIn: 3600,
      };

      localStorage.setItem(TOKEN_KEY, mockTokens.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, mockTokens.refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(mockUser));

      return {
        user: mockUser,
        tokens: mockTokens,
      };
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    await delay(500);

    try {
      // In real implementation, notify server about logout
      // await api.post('/auth/logout');

      // Clear local storage
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);

      return true;
    } catch (error) {
      console.error("Logout failed:", error);
      // Clear storage anyway
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      throw error;
    }
  },

  // Get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  // Get stored token
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Get refresh token
  getRefreshToken: () => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = localStorage.getItem(USER_KEY);
    return !!(token && user);
  },

  // Refresh access token
  refreshToken: async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    await delay(800);

    try {
      // In real implementation:
      // const response = await api.post('/auth/refresh', { refreshToken });

      // Mock token refresh
      const newTokens = {
        accessToken: "mock_access_token_refreshed_" + Date.now(),
        refreshToken: refreshToken, // Usually same refresh token
        expiresIn: 3600,
      };

      localStorage.setItem(TOKEN_KEY, newTokens.accessToken);

      return newTokens;
    } catch (error) {
      console.error("Token refresh failed:", error);
      // Clear tokens if refresh fails
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    await delay(1000);

    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        throw new Error("User not authenticated");
      }

      // Mock profile update
      const updatedUser = {
        ...currentUser,
        ...profileData,
        id: currentUser.id, // Don't allow ID changes
      };

      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));

      return updatedUser;
    } catch (error) {
      console.error("Profile update failed:", error);
      throw error;
    }
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    await delay(1200);

    try {
      // In real implementation:
      // await api.post('/auth/change-password', { currentPassword, newPassword });

      // Mock password change
      if (!currentPassword || !newPassword) {
        throw new Error("Current password and new password are required");
      }

      if (newPassword.length < 8) {
        throw new Error("New password must be at least 8 characters long");
      }

      return { message: "Password changed successfully" };
    } catch (error) {
      console.error("Password change failed:", error);
      throw error;
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    await delay(1000);

    try {
      // In real implementation:
      // await api.post('/auth/forgot-password', { email });

      // Mock forgot password
      if (!email) {
        throw new Error("Email is required");
      }

      return { message: "Password reset email sent successfully" };
    } catch (error) {
      console.error("Forgot password failed:", error);
      throw error;
    }
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    await delay(1000);

    try {
      // In real implementation:
      // await api.post('/auth/reset-password', { token, newPassword });

      // Mock reset password
      if (!token || !newPassword) {
        throw new Error("Token and new password are required");
      }

      if (newPassword.length < 8) {
        throw new Error("Password must be at least 8 characters long");
      }

      return { message: "Password reset successfully" };
    } catch (error) {
      console.error("Password reset failed:", error);
      throw error;
    }
  },

  // Validate session
  validateSession: async () => {
    const token = authService.getToken();
    const user = authService.getCurrentUser();

    if (!token || !user) {
      return false;
    }

    await delay(500);

    try {
      // In real implementation:
      // const response = await api.get('/auth/validate');

      // Mock session validation
      // In a real app, you'd validate the token with the server
      return true;
    } catch (error) {
      console.error("Session validation failed:", error);
      // Clear invalid session
      authService.logout();
      return false;
    }
  },
};
