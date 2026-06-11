'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateSeedPhrase, hashSeedPhrase } from '../../lib/auth';

export default function AuthPage() {
  const router = useRouter();
  const [inputSeed, setInputSeed] = useState('');
  const [generatedSeed, setGeneratedSeed] = useState('');
  const [error, setError] = useState('');

  // 1. Создание нового аккаунта
  const handleCreateAccount = async () => {
    const newSeed = generateSeedPhrase();
    setGeneratedSeed(newSeed);
    
    const hash = await hashSeedPhrase(newSeed);
    localStorage.setItem('tortick_seed', newSeed);
    localStorage.setItem('tortick_user_hash', hash);
  };

  // 2. Вход по существующей сид-фразе
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const words = inputSeed.trim().split(/\s+/);
    if (words.length !== 12) {
      setError(`В сид-фразе должно быть ровно 12 слов. У тебя сейчас: ${words.length}`);
      return;
    }

    const hash = await hashSeedPhrase(inputSeed);
    localStorage.setItem('tortick_seed', inputSeed.trim());
    localStorage.setItem('tortick_user_hash', hash);

    router.push('/');
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px', fontFamily: 'sans-serif', color: '#fff', background: '#111', borderRadius: '8px' }}>
      <h2>Вход в TORtick 🍰</h2>
      <p style={{ color: '#888' }}>Полная анонимность. Никаких паролей.</p>

      <div style={{ margin: '20px 0', padding: '15px', border: '1px solid #333', borderRadius: '6px' }}>
        <h4>Впервые тут?</h4>
        <button onClick={handleCreateAccount} style={{ background: '#ff4a5a', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}>
          Сгенерировать сид-фразу
        </button>
        
        {generatedSeed && (
          <div style={{ marginTop: '15px', padding: '10px', background: '#222', border: '1px dashed #ff4a5a' }}>
            <p style={{ color: '#ff4a5a', fontWeight: 'bold', margin: '0 0 5px 0' }}>⚠️ СКОПИРУЙ И СОХРАНИ:</p>
            <code style={{ display: 'block', wordBreak: 'break-all', background: '#000', padding: '5px', marginBottom: '10px' }}>{generatedSeed}</code>
            <button onClick={() => router.push('/')} style={{ background: '#4caf50', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }}>
              Я сохранил, войти
            </button>
          </div>
        )}
      </div>

      <div style={{ margin: '20px 0', padding: '15px', border: '1px solid #333', borderRadius: '6px' }}>
        <h4>Уже есть аккаунт?</h4>
        <form onSubmit={handleLogin}>
          <textarea
            placeholder="Вставь свои 12 слов через пробел..."
            value={inputSeed}
            onChange={(e) => setInputSeed(e.target.value)}
            rows={3}
            style={{ width: '100%', background: '#000', color: '#fff', border: '1px solid #333', padding: '8px', boxSizing: 'border-box', marginBottom: '10px' }}
          />
          {error && <p style={{ color: '#ff4a5a', margin: '0 0 10px 0', fontSize: '14px' }}>{error}</p>}
          <button type="submit" style={{ background: '#2196f3', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}>
            Войти по ключу
          </button>
        </form>
      </div>
    </div>
  );
}