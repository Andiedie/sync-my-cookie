export default {
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
  },

  async setAutoSyncSet (autoSyncSet) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({
        autoSyncSet: JSON.stringify([...autoSyncSet])
      }, resolve);
    });
  },

  async getAutoSyncSet () {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(['autoSyncSet'], ({ autoSyncSet }) => {
        resolve(new Set(JSON.parse(autoSyncSet || '[]')));
      });
    });
  }
};
