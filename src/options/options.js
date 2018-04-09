import gist from '@/utils/gist.js';
import storage from '@/utils/storage.js';
import swal from 'sweetalert2';
import '@/style/button.css';
import '@/options/options.css';
const tokenInput = document.getElementById('token');
const gistidInput = document.getElementById('gistid');
const secretInput = document.getElementById('secret');
const saveBtn = document.getElementById('save');

(async () => {
  const option = await storage.load();
  tokenInput.value = option.token || '';
  gistidInput.value = option.gistid || '';
  secretInput.value = option.secret || '';
})();

saveBtn.onclick = async () => {
  saveBtn.disabled = true;
  saveBtn.innerText = '...';
  try {
    const option = {
      token: tokenInput.value,
      gistid: gistidInput.value,
      secret: secretInput.value
    };
    if (!option.token || !option.secret) {
      throw new Error('token & secret requried!');
    }
    gist.init(option);
    // check for Gist OAuth scopes
    await gist.checkOAuthScope(option.token);
    if (option.gistid) {
      // check for gistid
      await gist.checkGistId();
      // check for secret
      await gist.pull();
    } else {
      option.gistid = await gist.createGist();
      gistidInput.value = option.gistid;
    }
    await storage.save(option);
    swal('Done', '', 'success');
  } catch (err) {
    swal(err.message, '', 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerText = 'Save';
  }
};
