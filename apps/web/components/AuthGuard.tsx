'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('tortick_user_hash');

    // Сценарий 1: У юзера нет ключа, и он НЕ на странице авторизации -> Бегом авторизоваться!
    if (!token && pathname !== '/auth') {
      router.push('/auth');
    } 
    // Сценарий 2: Юзер уже авторизован, но зачем-то зашел на /auth -> Квасим его обратно на главную
    else if (token && pathname === '/auth') {
      router.push('/');
    } 
    // В остальных случаях всё ок, показываем контент
    else {
      setIsReady(true);
    }
  }, [pathname, router]);

  // Пока идет проверка localStorage, лучше показать пустой экран или спиннер,
  // чтобы интерфейс не мигал скрытыми элементами
  if (!isReady && pathname !== '/auth') {
    return (
      <div style={{ background: '#000', color: '#fff', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <p>Загрузка TORtick... 🍰</p>
      </div>
    );
  }

  return <>{children}</>;
}