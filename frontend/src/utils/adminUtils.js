/**
 * Utility functions for checking admin permissions
 */

// List of admin user UIDs - replace these with your actual admin UIDs
const ADMIN_UIDS = [
  '29Q3uCEjBxO1CkLfWPWYJ2Si3Ch1', // Your admin UID
  // Add more admin UIDs as needed
];

/**
 * Check if a user is an admin based on their UID
 * @param {string} uid - The user's UID to check
 * @returns {boolean} - Whether the user is an admin
 */
export const isUserAdmin = (uid) => {
  if (!uid) return false;
  return ADMIN_UIDS.includes(uid);
};

/**
 * Get the admin status text for a user
 * @param {string} uid - The user's UID to check
 * @returns {string} - Admin status text
 */
export const getAdminStatusText = (uid) => {
  return isUserAdmin(uid) ? 'Admin' : 'User';
};
