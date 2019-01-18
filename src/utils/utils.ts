import { parse } from 'url';

export function getDomain(url: string): string {
  return parse(url).hostname || '';
}
