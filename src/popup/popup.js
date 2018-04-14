import swal from 'sweetalert2';
import cookie from '@/utils/cookie.js';
import gist from '@/utils/gist.js';
import storage from '@/utils/storage.js';
import '@/style/button.css';
import '@/style/iconfont.css';
import '@/popup/popup.css';
const pushBtn = document.getElementById('push');
const settingBtn = document.getElementById('setting');
const listEle = document.getElementById('list');
let option;
let cookieArray = [];
let autoSyncSet = new Set();

const ask = async (txt) => {
  return (await swal({
    title: txt,
    showCancelButton: true
  })).value;
};

settingBtn.onclick = () => {
  chrome.tabs.create({ 'url': '/options.html' });
};

pushBtn.onclick = async () => {
  try {
    pushBtn.disabled = true;
    const url = await getCurrentUrl();
    const array = await cookie.getAll({ url });
    if (array.length === 0) {
      swal('No cookie for current domain');
    } else {
      const domain = require('url').parse(url).hostname;
      const duplicatedIndex = cookieArray.findIndex(one => one.domain === domain);
      let askMsg = duplicatedIndex >= 0
        ? `Cookies for "${domain}" already exists. Replace them with these ${array.length} ones?`
        : `Push ${array.length} cookies for "${domain}"?`;
      if (await ask(askMsg)) {
        if (duplicatedIndex >= 0) cookieArray.splice(duplicatedIndex, 1);
        cookieArray.unshift({
          domain,
          url,
          cookies: array
        });
        await gist.push(JSON.stringify(cookieArray));
        swal('Pushed');
        renderList();
      }
    }
  } catch (err) {
    swal(err.response ? err.response.data.message : err.message);
  } finally {
    pushBtn.disabled = false;
  }
};

async function merge (e) {
  try {
    const one = cookieArray[this.cookie_index];
    if (one.cookies.length === 0) {
      return swal('Merged');
    }
    if (await ask(`Merge ${one.cookies.length} cookies for "${one.domain}"?`)) {
      cookie.setAll(one.cookies);
      swal('Merged');
    }
  } catch (err) {
    swal(err.response ? err.response.data.message : err.message);
  }
}

async function remove (e) {
  e.stopPropagation();
  try {
    this.disabled = true;
    const one = cookieArray[this.parentNode.cookie_index];
    if (await ask(`Remove ${one.cookies.length} cookies for "${one.domain}"?`)) {
      cookieArray.splice(this.parentNode.cookie_index, 1);
      autoSyncSet.delete(one.domain);
      await gist.push(JSON.stringify(cookieArray));
      await storage.setAutoSyncSet(autoSyncSet);
      swal('Deleted');
      renderList();
    }
  } catch (err) {
    swal(err.response ? err.response.data.message : err.message);
  } finally {
    this.disabled = false;
  }
}

async function toggleAutoSync (e) {
  e.stopPropagation();
  try {
    const one = cookieArray[this.parentNode.cookie_index];
    this.parentNode.classList.toggle('auto-sync');
    this.classList.toggle('icon-plus-minus');
    this.classList.toggle('icon-plus-add');
    if (autoSyncSet.has(one.domain)) {
      autoSyncSet.delete(one.domain);
    } else {
      autoSyncSet.add(one.domain);
    }
    await storage.setAutoSyncSet(autoSyncSet);
  } catch (err) {
    swal(err.response ? err.response.data.message : err.message);
  }
}

function renderList () {
  while (listEle.firstChild) listEle.removeChild(listEle.firstChild);
  for (let i = 0; i < cookieArray.length; i++) {
    const one = cookieArray[i];
    const buttonEle = document.createElement('button');
    buttonEle.className = 'button';
    buttonEle.cookie_index = i;
    buttonEle.onclick = merge;

    const closeEle = document.createElement('i');
    closeEle.className = 'iconfont icon-guanbi radius abosulte-right';
    closeEle.onclick = remove;

    const autoSyncEle = document.createElement('i');
    autoSyncEle.className = 'radius abosulte-left iconfont';
    autoSyncEle.onclick = toggleAutoSync;

    if (autoSyncSet.has(one.domain)) {
      buttonEle.className += ' auto-sync';
      autoSyncEle.className += ' icon-plus-minus';
    } else {
      autoSyncEle.className += ' icon-plus-add';
    }

    buttonEle.appendChild(document.createTextNode(` ${one.domain} `));
    buttonEle.appendChild(closeEle);
    buttonEle.appendChild(autoSyncEle);
    listEle.appendChild(buttonEle);
  }
  if (!listEle.firstChild) {
    const emptyEle = document.createElement('div');
    emptyEle.innerHTML = 'Empty';
    emptyEle.className = 'empty-wrapper';
    const helpEle = document.createElement('a');
    helpEle.className = 'iconfont icon-bangzhu help';
    helpEle.setAttribute('href', 'https://github.com/Andiedie/sync-my-cookie/blob/master/README.md');
    helpEle.setAttribute('target', '_blank');
    emptyEle.appendChild(helpEle);
    listEle.appendChild(emptyEle);
  }
}

async function getCurrentUrl () {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function (tabs) {
      resolve(tabs[0].url);
    });
  });
};

(async () => {
  pushBtn.disabled = true;
  option = await storage.load();
  if (!option.token || !option.gistid || !option.secret) {
    pushBtn.disabled = true;
    renderList();
    return;
  }
  gist.init(option);
  cookieArray = JSON.parse(await gist.pull());
  autoSyncSet = await storage.getAutoSyncSet();
  autoSyncSet = new Set(cookieArray.filter(one => autoSyncSet.has(one.domain)).map(one => one.domain));
  await storage.setAutoSyncSet(autoSyncSet);
  renderList();
  pushBtn.disabled = false;
})();
