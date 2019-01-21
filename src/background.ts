import _ from 'lodash';
import * as chromeUtil from './utils/chrome';
import {auto, AutoConfiguration, gist} from './utils/store';

const DEBOUNCE_DELAY = 10000;

/* tslint:disable no-console */

// Auto Merge
chrome.windows.onCreated.addListener(async () => {
  console.log('自动合并运行中');
  const list = (await filterDomain('autoMerge')).map(([domain]) => domain);
  if (list.length === 0) {
    console.log('没有需要自动合并的域名');
    return;
  }
  console.log(`共${list.length}个域名需要自动合并：${list.join(',')}`);
  let done = 0;
  for (const domain of list) {
    const cookies = await gist.getCookies(domain);
    await chromeUtil.importCookies(cookies);
    done++;
    console.log(`[${done}/${list.length}] ${domain}的${cookies.length}个Cookie已合并`);
  }
  if (done) {
    badge(`↓${done}`);
  }
});

// Auto Push
chrome.cookies.onChanged.addListener(_.debounce(async () => {
  try {
    console.log('自动推送运行中');
    const list = await filterDomain('autoPush');
    if (list.length === 0) {
      console.log('没有需要自动推送的域名');
      return;
    }
    console.log(list);
    console.log(`${list.length}个域名需要自动推送：${list.map(([domain]) => domain).join(',')}`);
    const bulk: Array<{domain: string, cookies: chrome.cookies.SetDetails[]}> = [];
    for (const [domain, config] of list) {
      console.log(`正在处理域名${domain}`);
      const newCookies = await chromeUtil.exportCookies(domain);
      const oldCookies = await gist.getCookies(domain);
      let rules: string[];
      if (config.autoPushName.length === 0) {
        console.log('该域名没有配置自动推送规则，默认将已保存的所有 Cookie 的 Name 作为规则');
        rules = _.uniq(oldCookies.map((cookie) => cookie.name as string));
      } else {
        console.log(`自动推送 Name 规则：${config.autoPushName.join(',')}`);
        rules = config.autoPushName;
      }

      const oldCookiesFiltered = oldCookies.filter((cookie) => rules.includes(cookie.name as string));
      const newCookiesFiltered = newCookies.filter((cookie) => rules.includes(cookie.name as string));
      // 数量测试，两者的数量必须相同
      console.log('数量测试，两者的数量必须相同');
      console.log(`Name过滤后，旧的共：${oldCookiesFiltered.length}个 新的共：${newCookiesFiltered.length}个`);
      if (oldCookiesFiltered.length !== newCookiesFiltered.length) {
        console.log(`数量测试不通过，需要推送`);
        bulk.push({domain, cookies: newCookies});
        continue;
      }
      console.log('数量测试通过');

      // 将 Cookie 数组转为 url##name => value, expirationDate 的 Object
      console.log('将 Cookie 数组转为 url##name => value, expirationDate 的 Object');
      const oldProcessed = _.mapValues(
        _.keyBy(oldCookiesFiltered, (cookie) => `${cookie.url}##${cookie.name}`),
        (cookie) => _.pick(cookie, ['value', 'expirationDate']),
      );
      const newProcessed = _.mapValues(
        _.keyBy(newCookiesFiltered, (cookie) => `${cookie.url}##${cookie.name}`),
        (cookie) => _.pick(cookie, ['value', 'expirationDate']),
      );
      console.log('旧的处理后', oldProcessed);
      console.log('新的处理后', newProcessed);

      // Key 测试，两者的 Key 组成必须完全相同
      console.log('Key 测试，两者的 Key 组成必须完全相同');
      if (!_.isEqual(Object.keys(oldProcessed).sort(), Object.keys(newProcessed).sort())) {
        console.log('Key 测试不通过，需要推送');
        bulk.push({domain, cookies: newCookies});
        continue;
      }

      // 逐个测试，对应 value 必须相等，旧的过期剩余时间比新的过期剩余时间不能少于50%
      console.log('Key 测试通过');
      console.log('逐个测试，对应 value 必须相等，旧的过期剩余时间比新的过期剩余时间不能少于50%');
      for (const key of Object.keys(oldProcessed)) {
        const oldOne = oldProcessed[key];
        const newOne = newProcessed[key];
        if (oldOne.value !== newOne.value) {
          console.log(`${key}对应的value两者不一致，需要推送`);
          bulk.push({domain, cookies: newCookies});
          break;
        }
        const now = new Date().getTime() / 1000;
        const oldRemain = oldOne.expirationDate as number - now;
        const newRemain = newOne.expirationDate as number - now;
        if (oldRemain < newRemain * 0.5) {
          console.log(`旧的还有${oldRemain}秒过期`);
          console.log(`新的还有${newRemain}秒过期`);
          console.log(`${oldRemain} / ${newRemain} = ${oldRemain / newRemain} < 0.5`);
          console.log('太旧了，不通过');
          bulk.push({domain, cookies: newCookies});
          break;
        }
      }
      console.log('逐个测试通过，不需要推送');
    }
    console.log(`共${bulk.length}个域名需要推送`);
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

async function filterDomain(type: 'autoPush' | 'autoMerge'): Promise<Array<[string, AutoConfiguration]>> {
  let list: Array<[string, AutoConfiguration]>;
  if (type === 'autoPush') {
    list = await auto.getAutoPush();
  } else {
    list = await auto.getAutoMerge();
  }
  if (list.length) {
    const ready = await gist.init();
    if (!ready) {
      return [];
    }
  }
  return list;
}
