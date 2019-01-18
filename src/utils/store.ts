import { Kevast } from 'kevast';
import { KevastChromeLocal, KevastChromeSync } from 'kevast-chrome';
import { KevastEncrypt } from 'kevast-encrypt';
import { KevastGist } from 'kevast-gist';
import { Pair } from 'kevast/dist/Pair';
import * as keys from './keys';
import { add2Front } from './utils';

const chromeLocal = new Kevast(new KevastChromeLocal());
const chromeSync = new Kevast(new KevastChromeSync());
const gistStore = new Kevast();

function getKey(name: string): string {
  switch (name) {
    case 'token':
      return keys.TOKEN_KEY;
    case 'password':
      return keys.PASSWORD_KEY;
    case 'gistId':
      return keys.GIST_ID_KEY;
    case 'filename':
      return keys.FILE_NAME_KEY;
    default:
      throw new Error('Unknown');
  }
}

export const setting = {
  async set(config: {
    token?: string,
    password?: string,
    gistId?: string,
    filename?: string,
  }) {
    const bulk = Object.entries(config).map((entry) => {
      return {
        key: getKey(entry[0]),
        value: entry[1],
      };
    });
    if (bulk.length === 0) {
      return;
    }
    await chromeSync.bulkSet(bulk);
  },
  async get(key: 'token' | 'password' | 'gistId' | 'filename'): Promise<string | undefined> {
    return chromeSync.get(getKey(key));
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
  async set(list: Array<{domain: string, cookies: chrome.cookies.SetDetails[]}>,
            domainList?: string[]): Promise<string[]> {
    if (!domainList) {
      domainList = await gist.getDomainList();
    }
    const bulk: Pair[] = [];
    let newDomainList = [...domainList];
    for (const {domain, cookies} of list) {
      newDomainList = add2Front(newDomainList, domain);
      bulk.push({key: domain, value: JSON.stringify(cookies)});
    }
    bulk.push({key: keys.DOMAIN_LIST_KEY, value: JSON.stringify(newDomainList)});
    await gistStore.bulkSet(bulk);
    return newDomainList;
  },
};
