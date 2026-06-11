const wordList = [
  "tort", "cream", "secret", "anon", "cyber", "secure", "token", "shadow", 
  "matrix", "ghost", "phantom", "alpha", "omega", "pixel", "vector", "space", 
  "planet", "comet", "orbit", "quantum", "digital", "crypto", "code", "shield", 
  "armor", "sword", "ninja", "hacker", "signal", "beacon", "router", "frost"
];

export function generateSeedPhrase(): string {
  const words: string[] = [];
  for (let i = 0; i < 12; i++) {
    const randomIndex = Math.floor(Math.random() * wordList.length);
    words.push(wordList[randomIndex]);
  }
  return words.join(" ");
}

export async function hashSeedPhrase(phrase: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(phrase.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}