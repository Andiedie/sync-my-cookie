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

  async setAutoMergeSet (autoMergeSet) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({
        autoMergeSet: JSON.stringify([...autoMergeSet])
      }, resolve);
    });
  },

  async getAutoMergeSet () {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(['autoMergeSet'], ({ autoMergeSet }) => {
        resolve(new Set(JSON.parse(autoMergeSet || '[]')));
      });
    });
  }
};
