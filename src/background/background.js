import cookie from '@/utils/cookie.js';
import gist from '@/utils/gist.js';
import storage from '@/utils/storage.js';
import debounce from 'lodash.debounce';

chrome.windows.onCreated.addListener(async function () {
  const option = await storage.load();
  if (!option.token || !option.gistid || !option.secret) {
    return;
  }
  gist.init(option);
  const autoSyncSet = await storage.getAutoSyncSet();
  if (autoSyncSet.size === 0) return;
  const cookieArray = JSON.parse(await gist.pull());
  const merged = [];
  for (const one of cookieArray) {
    if (autoSyncSet.has(one.domain)) {
      cookie.setAll(one.cookies);
      merged.push(one.domain);
    }
  }
  if (merged.length) {
    chrome.notifications.create('', {
      type: 'basic',
      iconUrl: './img/icon128.png',
      title: 'Cookies Merged',
      message: merged.join(','),
      contextMessage: 'Sync My Cookie'
    }, id => {
      chrome.alarms.create(id, {
        when: Date.now() + 2000
      });
    });
  }
});

chrome.alarms.onAlarm.addListener(function (alarm) {
  chrome.notifications.clear(alarm.name);
});

chrome.cookies.onChanged.addListener(debounce(async function (changeInfo) {
  const option = await storage.load();
  if (!option.token || !option.gistid || !option.secret) {
    return;
  }
  gist.init(option);
  const autoSyncSet = await storage.getAutoSyncSet();
  if (autoSyncSet.size === 0) return;
  const cookieArray = JSON.parse(await gist.pull());
  let updated = [];
  for (const one of cookieArray) {
    if (one.url && autoSyncSet.has(one.domain)) {
      const newCookies = await cookie.getAll({ url: one.url });
      const newCookiesJSON = JSON.stringify(newCookies);
      const oldCookiesJSON = JSON.stringify(one.cookies);
      if (oldCookiesJSON !== newCookiesJSON) {
        one.cookies = newCookies;
        updated.push(one.domain);
      }
    }
  }
  if (updated.length) {
    await gist.push(JSON.stringify(cookieArray));
    chrome.notifications.create('', {
      type: 'basic',
      iconUrl: './img/icon128.png',
      title: 'Cookies Pushed',
      message: updated.join(','),
      contextMessage: 'Sync My Cookie'
    }, id => {
      chrome.alarms.create(id, {
        when: Date.now() + 2000
      });
    });
  }
}, 10000));
