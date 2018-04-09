import swal from 'sweetalert2';
import cookie from '@/utils/cookie.js';
import gist from '@/utils/gist.js';
import storage from '@/utils/storage.js';
import '@/style/button.css';
import '@/style/iconfont.css';
import '@/popup/popup.css';
const pushBtn = document.getElementById('push');
const pullBtn = document.getElementById('pull');
const settingBtn = document.getElementById('setting');
let option;

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
    const cookieArray = await cookie.export();
    if (cookieArray.length === 0) {
      swal('No cookie for current URL');
    } else if (await ask(`Push ${cookieArray.length} cookies for "${cookieArray[0].domain}"?`)) {
      await gist.push(JSON.stringify(cookieArray));
      swal('Push done');
    }
  } catch (err) {
    swal(err.response ? err.response.data.message : err.message);
  } finally {
    pushBtn.disabled = false;
  }
};

pullBtn.onclick = async () => {
  try {
    pullBtn.disabled = true;
    const cookieArray = JSON.parse(await gist.pull());
    if (cookieArray.length === 0) {
      swal('Pull done');
    } else if (await ask(`Pull ${cookieArray.length} cookies for "${cookieArray[0].domain}"?`)) {
      await cookie.import(cookieArray);
      swal('Pull done');
    }
  } catch (err) {
    swal(err.response ? err.response.data.message : err.message);
  } finally {
    pullBtn.disabled = false;
  }
};

(async () => {
  option = await storage.load();
  if (!option.token || !option.gistid || !option.secret) {
    pushBtn.disabled = true;
    pullBtn.disabled = true;
  }
  gist.init(option);
})();
