cookie = {
  async exportToJSON () {
    const cookies = await getAll(await getCurrentUrl());
    return JSON.stringify(cookies);
  },
  async importFromJSON (json) {
    let cookieArray;
    cookieArray = JSON.parse(json);
    if (!(cookieArray instanceof Array)) cookieArray = [cookieArray];
    for (const fullCookie of cookieArray) {
      const cookie = cookieForCreationFromFullCookie(fullCookie);
      try {
        chrome.cookies.set(cookie);
      } catch (e) {
        alert(e.message);
        return;
      }
    }
  }
};
async function getCurrentUrl () {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function (tabs) {
      resolve(tabs[0].url);
    });
  });
}

async function getAll (url) {
  return new Promise((resolve, reject) => {
    chrome.cookies.getAll({ url }, function (cks) {
      resolve(cks);
    });
  });
}

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
