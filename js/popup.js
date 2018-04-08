const pushBtn = document.getElementById('push');
const pullBtn = document.getElementById('pull');
const settingBtn = document.getElementById('setting');
let option;

settingBtn.onclick = () => {
  chrome.tabs.create({ 'url': '/options.html' });
};

pushBtn.onclick = async () => {
  try {
    pushBtn.disabled = true;
    const cookiesJson = await cookie.exportToJSON();
    await gist.push(cookiesJson);
  } catch (err) {
    alert(err.response ? err.response.data.message : err.message);
  } finally {
    pushBtn.disabled = false;
  }
};

pullBtn.onclick = async () => {
  try {
    pullBtn.disabled = true;
    const cookiesJson = await gist.pull();
    await cookie.importFromJSON(cookiesJson);
  } catch (err) {
    alert(err.response ? err.response.data.message : err.message);
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
