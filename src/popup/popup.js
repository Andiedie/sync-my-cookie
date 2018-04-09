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
      // 覆盖
      const domain = require('url').parse(await cookie.getCurrentUrl()).hostname;
      const duplicatedIndex = cookieArray.findIndex(one => one.domain === domain);
      let askMsg = duplicatedIndex >= 0
        ? `Cookies for "${domain}" already exists. Replace them with these ${array.length} ones?`
        : `Push ${array.length} cookies for "${domain}"?`;
      if (await ask(askMsg)) {
        cookieArray.splice(duplicatedIndex, 1);
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
    this.disabled = true;
    const one = cookieArray[this.cookie_index];
    if (one.cookies.length === 0) {
      return swal('Merged');
    }
    if (await ask(`Merge ${one.cookies.length} cookies for "${one.domain}"?`)) {
      await cookie.import(one.cookies);
      swal('Merged');
    }
  } catch (err) {
    swal(err.response ? err.response.data.message : err.message);
  } finally {
    this.disabled = false;
  }
}

async function remove (e) {
  e.stopPropagation();
  try {
    this.disabled = true;
    const one = cookieArray[this.cookie_index];
    if (await ask(`Remove ${one.cookies.length} cookies for "${one.domain}"?`)) {
      cookieArray.splice(this.cookie_index, 1);
      await gist.push(JSON.stringify(cookieArray));
      swal('Deleted');
      renderList();
    }
  } catch (err) {
    swal(err.response ? err.response.data.message : err.message);
  } finally {
    this.disabled = false;
  }
}

function renderList () {
  while (listEle.firstChild) listEle.removeChild(listEle.firstChild);
  for (let i = 0; i < cookieArray.length; i++) {
    const buttonEle = document.createElement('button');
    buttonEle.className = 'button';
    buttonEle.cookie_index = i;
    buttonEle.onclick = merge;
    const iEle = document.createElement('i');
    iEle.className = 'iconfont icon-xiazai';
    buttonEle.appendChild(iEle);
    buttonEle.appendChild(document.createTextNode(` ${cookieArray[i].domain} `));
    const divEle = document.createElement('div');
    divEle.innerHTML = 'X';
    divEle.className = 'close';
    divEle.cookie_index = i;
    divEle.onclick = remove;
    buttonEle.appendChild(divEle);
    listEle.appendChild(buttonEle);
  }
  if (!listEle.firstChild) {
    const divEle = document.createElement('div');
    divEle.innerHTML = 'Empty';
    divEle.className = 'empty-wrapper';
    listEle.appendChild(divEle);
  }
}

(async () => {
  option = await storage.load();
  if (!option.token || !option.gistid || !option.secret) {
    pushBtn.disabled = true;
    return;
  }
  gist.init(option);
  cookieArray = JSON.parse(await gist.pull());
  renderList();
})();
