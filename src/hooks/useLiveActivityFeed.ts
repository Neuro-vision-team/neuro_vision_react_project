import { useEffect, useState } from 'react';

const seed = [
  'New assessment started',
  'PLR scan completed',
  'AI marked medium risk',
  'Emergency escalation triggered',
  'Team doctor logged in',
];

export function useLiveActivityFeed() {
  const [feed, setFeed] = useState(() => seed.slice(0, 3).map((message, i) => ({ id: `${i}`, message, time: new Date().toLocaleTimeString() })));

  useEffect(() => {
    const timer = setInterval(() => {
      const message = seed[Math.floor(Math.random() * seed.length)];
      const item = { id: crypto.randomUUID(), message, time: new Date().toLocaleTimeString() };
      setFeed((prev) => [item, ...prev].slice(0, 8));
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return feed;
}
