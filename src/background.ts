import _ from 'lodash';
import * as chromeUtil from './utils/chrome';
import {auto, gist} from './utils/store';

const DEBOUNCE_DELAY = 10000;

// Auto Merge
chrome.windows.onCreated.addListener(async () => {
  const list = await filterDomain('autoMerge');
  if (list.length === 0) {
    return;
  }
  for (const domain of list) {
    const cookies = await gist.getCookies(domain);
    await chromeUtil.importCookies(cookies);
  }
  badge(`↓${list.length}`);
});

// Auto Push
chrome.cookies.onChanged.addListener(_.debounce(async () => {
  const list = await filterDomain('autoPush');
  if (list.length === 0) {
    return;
  }
  const bulk: Array<{domain: string, cookies: chrome.cookies.SetDetails[]}> = [];
  for (const domain of list) {
    const newCookies = await chromeUtil.exportCookies(domain);
    const oldCookies = await gist.getCookies(domain);
    if (_.isEqual(newCookies, oldCookies)) {
      continue;
    }
    bulk.push({domain, cookies: newCookies});
  }
  if (bulk.length) {
    await gist.set(bulk);
    badge(`↑${bulk.length}`, 'green');
  }
}, DEBOUNCE_DELAY));

function badge(text: string, color: string = 'red', delay: number = 5000) {
  chrome.browserAction.setBadgeText({text});
  chrome.browserAction.setBadgeBackgroundColor({color});
  setTimeout(() => {
    chrome.browserAction.setBadgeText({text: ''});
  }, delay);
}

async function filterDomain(type: 'autoPush' | 'autoMerge'): Promise<string[]> {
  const ready = await gist.init();
  if (!ready) {
    return [];
  }
  const domainList = await gist.getDomainList();
  const enableList: string[] = [];
  for (const domain of domainList) {
    const autoConfig = await auto.get(domain);
    if (autoConfig[type]) {
      enableList.push(domain);
    }
  }
  return enableList;
}
