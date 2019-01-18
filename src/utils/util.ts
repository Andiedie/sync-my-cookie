import { parse } from 'url';

export function getDomain(url: string): string {
  return parse(url).hostname || '';
}

export function generateKey(domain: string, direction: 'push' | 'merge') {
  return `${domain}_AUTO_${direction.toUpperCase()}`;
}
