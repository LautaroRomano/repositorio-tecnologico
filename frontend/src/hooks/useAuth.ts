import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Comprueba si hay un token en localStorage
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const requireAuth = (action: () => void) => {
    if (isLoggedIn) {
      action();
    } else {
      toast.info('Inicia sesión para continuar', { autoClose: 3000 });
      router.push('/login');
    }
  };

  return { isLoggedIn, requireAuth };
}