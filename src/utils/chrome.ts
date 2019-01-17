export function getCurrentTabUrl(): Promise<string> {
  return new Promise<string>((resolve) => {
    chrome.tabs.query({
      active: true,
      currentWindow: true,
    }, (tabs) => resolve(tabs[0].url));
  });
}

export async function importCookies(cookies: chrome.cookies.SetDetails[]): Promise<void> {
  await Promise.all(cookies.map((cookie) => {
    return new Promise<void>((resolve) => {
      chrome.cookies.set(cookie, () => resolve());
    });
  }));
}

export function exportCookies(url: string): Promise<chrome.cookies.SetDetails[]> {
  return new Promise((resolve) => {
    chrome.cookies.getAll({url}, (cookies) => {
      resolve(Cookies2SetDetails(cookies));
    });
  });
}

function Cookies2SetDetails(cookies: chrome.cookies.Cookie[]): chrome.cookies.SetDetails[] {
  return cookies.map((cookie) => {
    const result: chrome.cookies.SetDetails = {
      name: cookie.name,
      value: cookie.value,
      path: cookie.path,
      secure: cookie.secure,
      httpOnly: cookie.httpOnly,
      storeId: cookie.storeId,
      url: buildUrl(cookie.secure, cookie.domain, cookie.path),
    };
    if (!cookie.httpOnly) {
      result.domain = cookie.domain;
    }
    if (!cookie.session) {
      result.expirationDate = cookie.expirationDate;
    }
    return result;
  });
}

function buildUrl(secure: boolean, domain: string, path: string): string {
  if (domain.startsWith('.')) {
    domain = domain.substr(1);
  }
  return `http${secure ? 's' : ''}://${domain}${path}`;
}
