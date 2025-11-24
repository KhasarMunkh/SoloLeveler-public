import { useUser } from '@clerk/clerk-expo';
import { useApi } from '../lib/api';
import { useEffect } from 'react';

export default function UserInitializer() {
  const { user, isLoaded } = useUser();
  const { createUser } = useApi();

  useEffect(() => {
    const initializeUser = async () => {
      if (isLoaded && user) {
        try {
          await createUser({
            clerkId: user.id,
            email: user.emailAddresses[0]?.emailAddress || '',
            username: user.username || user.firstName || user.emailAddresses[0]?.emailAddress?.split('@')[0] || ''
          });
        } catch (error) {
          console.log('User already exists or creation failed:', error);
        }
      }
    };

    initializeUser();
  }, [isLoaded, user]);

  return null;
}