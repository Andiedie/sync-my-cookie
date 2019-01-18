import { parse } from 'url';

export function getDomain(url: string): string {
  const hostname =  parse(url).hostname || '';
  const lastDot = hostname.lastIndexOf('.');
  const nextDot = hostname.lastIndexOf('.', lastDot - 1);
  if (nextDot !== -1) {
    return hostname.substr(nextDot + 1);
  } else {
    return hostname;
  }
}

export function add2Front(array: string[], ele: string): string[] {
  let result = [...array];
  result = result.filter((e) => e !== ele);
  result.unshift(ele);
  return result;
}
