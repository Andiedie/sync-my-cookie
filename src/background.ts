import _ from 'lodash';
import * as chromeUtil from './utils/chrome';
import {auto, gist} from './utils/store';

const DEBOUNCE_DELAY = 10000;

// Auto Merge
chrome.windows.onCreated.addListener(async () => {
  console.log('AutoMerge run');
  const list = await filterDomain('autoMerge');
  if (list.length === 0) {
    return;
  }
  console.log(list.join(','));
  let done = 0;
  for (const domain of list) {
    const cookies = await gist.getCookies(domain);
    console.log(domain, cookies.length);
    if (cookies.length) {
      await chromeUtil.importCookies(cookies);
      done++;
    }
  }
  if (done) {
    badge(`↓${done}`);
  }
});

// Auto Push
chrome.cookies.onChanged.addListener(_.debounce(async () => {
  try {
    console.log('AutoPush run');
    const list = await filterDomain('autoPush');
    if (list.length === 0) {
      console.log('No domain configs to push');
      return;
    }
    console.log(`${list.length} config to push: ${list.join(',')}`);
    const bulk: Array<{domain: string, cookies: chrome.cookies.SetDetails[]}> = [];
    for (const domain of list) {
      const newCookies = await chromeUtil.exportCookies(domain);
      const oldCookies = await gist.getCookies(domain);
      if (_.isEqual(newCookies, oldCookies)) {
        console.log(`${domain} identical`);
        continue;
      }
      console.log(`${domain} needs to push`);
      bulk.push({domain, cookies: newCookies});
    }
    console.log(`${bulk.length} need to push`);
    console.log(JSON.stringify(bulk));
    if (bulk.length) {
      await gist.set(bulk);
      badge(`↑${bulk.length}`, 'green');
    }
  } catch (err) {
    console.error(err);
    badge('err', 'black', 100000);
  }
}, DEBOUNCE_DELAY));

function badge(text: string, color: string = 'red', delay: number = 10000) {
  chrome.browserAction.setBadgeText({text});
  chrome.browserAction.setBadgeBackgroundColor({color});
  setTimeout(() => {
    chrome.browserAction.setBadgeText({text: ''});
  }, delay);
}

async function filterDomain(type: 'autoPush' | 'autoMerge'): Promise<string[]> {
  let list: string[];
  if (type === 'autoPush') {
    list = await auto.getAutoPush();
  } else {
    list = await auto.getAutoMerge();
  }
  console.log(type, list.join(','));
  if (list.length) {
    const ready = await gist.init();
    if (!ready) {
      return [];
    }
  }
  return list;
}
