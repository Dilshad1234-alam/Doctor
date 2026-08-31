'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LiveSyncWatcher() {
  const router = useRouter();

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'doctor_websiteConfig') {
        // Trigger Next.js router refresh to fetch new server data seamlessly
        router.refresh();
      }
    };
    
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [router]);

  return null;
}
