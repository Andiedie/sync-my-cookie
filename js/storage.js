storage = {
  async save (option) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.set({
        token: option.token,
        gistid: option.gistid,
        secret: option.secret
      }, resolve);
    });
  },

  async load () {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(['token', 'gistid', 'secret'], resolve);
    });
  }
};
