import { Kevast } from 'kevast';
import { KevastChromeLocal, KevastChromeSync } from 'kevast-chrome';
import { KevastEncrypt } from 'kevast-encrypt';
import { KevastGist } from 'kevast-gist';
import { Pair } from 'kevast/dist/Pair';
import * as keys from './keys';

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

export interface AutoConfiguration {
  autoPush: boolean;
  autoMerge: boolean;
  autoPushName: string[];
}

export const auto = {
  async get(domain: string): Promise<AutoConfiguration> {
    const origin = await auto.getAll();
    const result = origin.get(domain);
    return result || {autoPush: false, autoMerge: false, autoPushName: []};
  },
  async set(domain: string, config: AutoConfiguration) {
    const origin = await auto.getAll();
    origin.set(domain, config);
    await chromeLocal.set(keys.AUTO_CONFIG_KEY, JSON.stringify([...origin]));
  },
  async getAutoPush(): Promise<Array<[string, AutoConfiguration]>> {
    const origin = await auto.getAll();
    return [...origin].filter(([_, config]) => config.autoPush);
  },
  async getAutoMerge(): Promise<Array<[string, AutoConfiguration]>> {
    const origin = await auto.getAll();
    return [...origin].filter(([_, config]) => config.autoMerge);
  },
  async getAll(): Promise<Map<string, AutoConfiguration>> {
    const json = await chromeLocal.get(keys.AUTO_CONFIG_KEY) || '[]';
    return new Map(JSON.parse(json));
  },
  async remove(domain: string) {
    const origin = await auto.getAll();
    origin.delete(domain);
    await chromeLocal.set(keys.AUTO_CONFIG_KEY, JSON.stringify([...origin]));
  },
};

let initialized = false;
export const gist = {
  async init(): Promise<boolean> {
    if (initialized) {
      return true;
    }
    const token = await setting.get('token');
    const password = await setting.get('password');
    if (!token || !password) {
      return false;
    }
    const gistId = await setting.get('gistId');
    const filename = await setting.get('filename');
    gistStore.add(new KevastGist(token, gistId, filename));
    gistStore.use(new KevastEncrypt(password));
    initialized = true;
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
    const newDomainList = [...domainList];
    for (const {domain, cookies} of list) {
      if (!newDomainList.includes(domain)) {
        newDomainList.push(domain);
      }
      bulk.push({key: domain, value: JSON.stringify(cookies)});
    }
    bulk.push({key: keys.DOMAIN_LIST_KEY, value: JSON.stringify(newDomainList)});
    await gistStore.bulkSet(bulk);
    return newDomainList;
  },
  async remove(domain: string, domainList?: string[]): Promise<string[]> {
    if (!domainList) {
      domainList = await gist.getDomainList();
    }
    const newDomainList = [...domainList].filter((d) => d !== domain);
    const bulk: Pair[] = [
      {key: keys.DOMAIN_LIST_KEY, value: JSON.stringify(newDomainList)},
      {key: domain, value: undefined},
    ];
    await gistStore.bulkSet(bulk);
    return newDomainList;
  },
};
