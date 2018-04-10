import cookie from '@/utils/cookie.js';
import gist from '@/utils/gist.js';
import storage from '@/utils/storage.js';

chrome.windows.onCreated.addListener(async function () {
  const option = await storage.load();
  if (!option.token || !option.gistid || !option.secret) {
    return;
  }
  gist.init(option);
  const cookieArray = JSON.parse(await gist.pull());
  const autoMergeSet = await storage.getAutoMergeSet();
  const merged = [];
  for (const one of cookieArray) {
    if (autoMergeSet.has(one.domain)) {
      cookie.import(one.cookies);
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
