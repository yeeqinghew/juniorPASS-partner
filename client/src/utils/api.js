/**
 * API Configuration for JuniorPASS Partner Portal
 * Centralized API management with authentication
 */

/**
 * Get the API base URL based on environment
 * Priority: VITE_API_URL > hostname:port > fallback
 */
const getBaseURL = () => {
  // 1. Use explicit API URL if provided (for production/staging)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // 2. Development mode - use localhost with configurable port
  const port = import.meta.env.VITE_API_PORT || "5000";
  const hostname = window.location.hostname;

  // Use https in production, http in development
  const protocol = hostname === 'localhost' || hostname === '127.0.0.1' ? 'http' : 'https';

  return `${protocol}://${hostname}:${port}`;
};

/**
 * Authenticated fetch wrapper for partner portal
 * Automatically adds Authorization header with JWT token
 *
 * @param {string} endpoint - API endpoint (e.g., "/partners/login")
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>}
 */
export const fetchWithAuth = async (endpoint, options = {}) => {
  const baseURL = getBaseURL();
  const token = localStorage.getItem("token");

  // Build full URL
  const url = endpoint.startsWith('http') ? endpoint : `${baseURL}${endpoint}`;

  // Default headers
  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  // Add Authorization header if token exists
  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  // Merge headers
  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401) {
      console.warn("Partner session expired - redirecting to login");
      localStorage.removeItem("token");
      window.location.href = '/login';
    }

    return response;
  } catch (error) {
    console.error(`Partner API Error [${endpoint}]:`, error.message);
    throw error;
  }
};

/**
 * API Endpoints for Partner Portal
 * All endpoints (except login) require partner authentication
 */
export const API_ENDPOINTS = {
  // Partner Auth
  LOGIN: "/partners/login",
  VERIFY_AUTH: "/auth/is-verify",
  CHANGE_PASSWORD: "/partners/change-password",
  COMPLETE_PROFILE: "/partners/complete-profile",
  RESET_PASSWORD: "/partners/reset-password",

  // Partner Profile
  GET_PARTNER: "/partners/",
  UPDATE_PARTNER: (partnerId) => `/partners/${partnerId}`,

  // Partner Dashboard
  DASHBOARD_OVERVIEW: "/partners/dashboard/overview",
  DASHBOARD_BOOKINGS: "/partners/dashboard/bookings",
  DASHBOARD_REVENUE: "/partners/dashboard/revenue",

  // Classes/Listings Management
  GET_ALL_LISTINGS: "/listings/partner",
  GET_PARTNER_LISTINGS: (partnerId) => `/listings/partner/${partnerId}`,
  GET_LISTING: (listingId) => `/listings/${listingId}`,
  CREATE_LISTING: "/listings",
  UPDATE_LISTING: (listingId) => `/listings/${listingId}`,
  UPDATE_LISTING_SCHEDULES: (listingId) => `/listings/${listingId}/schedules`,
  UPDATE_LISTING_STATUS: (listingId) => `/listings/${listingId}/status`,
  DELETE_LISTING: (listingId) => `/listings/${listingId}`,
  TOGGLE_LISTING_STATUS: (listingId) => `/listings/${listingId}/toggle-status`,

  // Schedules
  GET_SCHEDULES: (listingId) => `/schedules/${listingId}`,
  CREATE_SCHEDULE: "/schedules",
  UPDATE_SCHEDULE: (scheduleId) => `/schedules/${scheduleId}`,
  DELETE_SCHEDULE: (scheduleId) => `/schedules/${scheduleId}`,

  // Bookings
  GET_BOOKINGS: "/bookings/partner",
  GET_BOOKINGS_FOR_LISTING: (listingId) => `/bookings/listing/${listingId}`,
  CONFIRM_BOOKING: (bookingId) => `/bookings/${bookingId}/confirm`,
  CANCEL_BOOKING: (bookingId) => `/bookings/${bookingId}/cancel`,

  // Outlets
  GET_OUTLETS: (partnerId) => `/partners/${partnerId}/outlets`,
  CREATE_OUTLET: "/outlets",
  UPDATE_OUTLET: (outletId) => `/outlets/${outletId}`,
  DELETE_OUTLET: (outletId) => `/outlets/${outletId}`,

  // Media Upload
  UPLOAD_PARTNER_LOGO: "/media/upload/partner-logo",
  UPLOAD_PARTNER_DP: "/media/upload/partner-dp",
  UPLOAD_LISTING_IMAGE: "/media/upload/listing-image",
  DELETE_MEDIA: "/media/delete",

  // Notifications
  GET_NOTIFICATIONS: "/notifications/partner",
  GET_UNREAD_COUNT: "/notifications/partner/unread-count",
  MARK_NOTIFICATION_READ: (notificationId) => `/notifications/${notificationId}/read`,
  MARK_ALL_NOTIFICATIONS_READ: "/notifications/partner/mark-all-read",

  // Miscellaneous
  GET_ALL_CATEGORIES: "/misc/getAllCategories",
  GET_ALL_AGE_GROUPS: "/misc/getAllAgeGroups",
  GET_ALL_PACKAGES: "/misc/getAllPackages",
};

export default getBaseURL;
