import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export default function useAuthRedirect(roles?:string[]) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (roles && !roles.includes(user.role.toLowerCase())) {
        router.replace('/dashboard');
      }
    }
  }, [user, loading, roles, router]);

  return { user, loading };
}
