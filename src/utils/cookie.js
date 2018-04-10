export default {
  async export () {
    return this.getAll({ url: await this.getCurrentUrl() });
  },

  import (cookieArray) {
    for (const fullCookie of cookieArray) {
      const cookie = cookieForCreationFromFullCookie(fullCookie);
      chrome.cookies.set(cookie);
    }
  },

  async getCurrentUrl () {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({
        active: true,
        currentWindow: true
      }, function (tabs) {
        resolve(tabs[0].url);
      });
    });
  },

  async getAll (details) {
    return new Promise((resolve, reject) => {
      chrome.cookies.getAll(details, function (cks) {
        resolve(cks);
      });
    });
  }
};

function cookieForCreationFromFullCookie (fullCookie) {
  const newCookie = {
    name: fullCookie.name,
    value: fullCookie.value,
    path: fullCookie.path,
    secure: fullCookie.secure,
    httpOnly: fullCookie.httpOnly,
    storeId: fullCookie.storeId,
    url: buildUrl(fullCookie.secure, fullCookie.domain, fullCookie.path)
  };
  if (!fullCookie.hostOnly) newCookie.domain = fullCookie.domain;
  if (!fullCookie.session) newCookie.expirationDate = fullCookie.expirationDate;
  return newCookie;
}

function buildUrl (secure, domain, path) {
  if (domain.substr(0, 1) === '.') domain = domain.substring(1);
  return 'http' + (secure ? 's' : '') + '://' + domain + path;
}
