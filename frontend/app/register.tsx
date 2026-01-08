import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function RegisterRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/register-new');
  }, []);
  
  return null;
}
