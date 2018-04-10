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
let autoMergeSet = new Set();

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
    const array = await cookie.export();
    if (array.length === 0) {
      swal('No cookie for current domain');
    } else {
      const domain = require('url').parse(await cookie.getCurrentUrl()).hostname;
      const duplicatedIndex = cookieArray.findIndex(one => one.domain === domain);
      let askMsg = duplicatedIndex >= 0
        ? `Cookies for "${domain}" already exists. Replace them with these ${array.length} ones?`
        : `Push ${array.length} cookies for "${domain}"?`;
      if (await ask(askMsg)) {
        if (duplicatedIndex >= 0) cookieArray.splice(duplicatedIndex, 1);
        cookieArray.unshift({
          domain,
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
      cookie.import(one.cookies);
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
      autoMergeSet.delete(one.domain);
      await gist.push(JSON.stringify(cookieArray));
      await storage.setAutoMergeSet(autoMergeSet);
      swal('Deleted');
      renderList();
    }
  } catch (err) {
    swal(err.response ? err.response.data.message : err.message);
  } finally {
    this.disabled = false;
  }
}

async function toggleAutoMerge (e) {
  e.stopPropagation();
  try {
    const one = cookieArray[this.parentNode.cookie_index];
    this.parentNode.classList.toggle('auto-merge');
    this.classList.toggle('icon-plus-minus');
    this.classList.toggle('icon-plus-add');
    if (autoMergeSet.has(one.domain)) {
      autoMergeSet.delete(one.domain);
    } else {
      autoMergeSet.add(one.domain);
    }
    await storage.setAutoMergeSet(autoMergeSet);
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

    const autoMergeEle = document.createElement('i');
    autoMergeEle.className = 'radius abosulte-left iconfont';
    autoMergeEle.onclick = toggleAutoMerge;

    if (autoMergeSet.has(one.domain)) {
      buttonEle.className += ' auto-merge';
      autoMergeEle.className += ' icon-plus-minus';
    } else {
      autoMergeEle.className += ' icon-plus-add';
    }

    buttonEle.appendChild(document.createTextNode(` ${one.domain} `));
    buttonEle.appendChild(closeEle);
    buttonEle.appendChild(autoMergeEle);
    listEle.appendChild(buttonEle);
  }
  if (!listEle.firstChild) {
    const emptyEle = document.createElement('div');
    emptyEle.innerHTML = 'Empty';
    emptyEle.className = 'empty-wrapper';
    listEle.appendChild(emptyEle);
  }
}

(async () => {
  option = await storage.load();
  if (!option.token || !option.gistid || !option.secret) {
    pushBtn.disabled = true;
    renderList();
    return;
  }
  gist.init(option);
  cookieArray = JSON.parse(await gist.pull());
  autoMergeSet = await storage.getAutoMergeSet();
  autoMergeSet = new Set(cookieArray.filter(one => autoMergeSet.has(one.domain)).map(one => one.domain));
  await storage.setAutoMergeSet(autoMergeSet);
  renderList();
})();
