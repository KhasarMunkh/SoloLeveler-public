import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const useApi = () => {
  const { getToken, isSignedIn } = useAuth();
  const router = useRouter();

  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    // Check if user is signed in
    if (!isSignedIn) {
      throw new Error('Not authenticated');
    }

    try {
      // Get fresh token from Clerk
      const token = await getToken();

      if (!token) {
        throw new Error('Failed to get authentication token');
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      // Handle different error statuses
      if (response.status === 401) {
        // Unauthorized - token might be invalid, redirect to auth
        console.error('Authentication failed. Redirecting to sign in.');
        router.replace('/(auth)/sign-in');
        throw new Error('Authentication failed. Please sign in again.');
      }

      if (response.status === 403) {
        throw new Error('You do not have permission to perform this action.');
      }

      if (!response.ok) {
        // Try to parse error message from response
        let errorMessage = `API Error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      // Log error for debugging
      console.error('API call failed:', endpoint, error);
      throw error;
    }
  };

  return { apiCall };
};