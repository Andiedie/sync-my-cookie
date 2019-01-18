import { Kevast } from 'kevast';
import { KevastChromeLocal, KevastChromeSync } from 'kevast-chrome';
import { KevastEncrypt } from 'kevast-encrypt';
import { KevastGist } from 'kevast-gist';
import * as keys from './keys';

const chromeLocal = new Kevast(new KevastChromeLocal());
const chromeSync = new Kevast(new KevastChromeSync());
const gistStore = new Kevast(new KevastChromeLocal());

const keyTable: any = {
  token: keys.TOKEN_KEY,
  password: keys.PASSWORD_KEY,
  gistId: keys.GIST_ID_KEY,
  filename: keys.FILE_NAME_KEY,
};

export const setting = {
  async set(config: {
    token?: string,
    password?: string,
    gistId?: string,
    filename?: string,
  }) {
    const bulk = Object.entries(config).map((entry) => {
      return {
        key: keyTable[entry[0]],
        value: entry[1],
      };
    });
    if (bulk.length === 0) {
      return;
    }
    await chromeSync.bulkSet(bulk);
  },
  get(key: 'token' | 'password' | 'gistId' | 'filename'): Promise<string | undefined> {
    return chromeSync.get(keyTable(key));
  },
};

export const auto = {
  async get(domain: string) {
    return {
      autoPush: await chromeLocal.get(keys.autoKey(domain, 'push')) === 'true',
      autoMerge: await chromeLocal.get(keys.autoKey(domain, 'merge')) === 'true',
    };
  },
  async set(domain: string, config: {autoPush: boolean, autoMerge: boolean}) {
    await chromeLocal.bulkSet([
      {key: keys.autoKey(domain, 'push'), value: config.autoPush ? 'true' : 'false'},
      {key: keys.autoKey(domain, 'merge'), value: config.autoMerge ? 'true' : 'false'},
    ]);
  },
};

export const gist = {
  async init(): Promise<boolean> {
    const token = await setting.get('token');
    const password = await setting.get('password');
    if (!token || !password) {
      return false;
    }
    const gistId = await setting.get('gistId');
    const filename = await setting.get('filename');
    gistStore.add(new KevastGist(token, gistId, filename));
    gistStore.use(new KevastEncrypt(password));
    return true;
  },
  async getDomainList(): Promise<string[]> {
    return JSON.parse(await gistStore.get(keys.DOMAIN_LIST_KEY) || '[]');
  },
  async getCookies(domain: string): Promise<chrome.cookies.SetDetails[]> {
    return JSON.parse(await gistStore.get(domain) || '[]');
  },
  async set(domainList: string[], domain: string, cookies: chrome.cookies.SetDetails[]) {
    await gistStore.bulkSet([
      {key: keys.DOMAIN_LIST_KEY, value: JSON.stringify(domainList)},
      {key: domain, value: JSON.stringify(cookies)},
    ]);
  },
};
