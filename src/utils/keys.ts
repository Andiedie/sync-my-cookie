export function autoPushMergeKey(domain: string, direction: 'push' | 'merge') {
  return `${domain}_AUTO_${direction.toUpperCase()}`;
}

export const DOMAIN_LIST_KEY = '__DOMAIN_LIST__';
export const TOKEN_KEY = '__TOKEN__';
export const PASSWORD_KEY = '__PASSWORD__';
export const GIST_ID_KEY = '__GIST_ID__';
export const FILE_NAME_KEY = '__FILE_NAME__';
