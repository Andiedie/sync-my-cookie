export function getCurrentTabUrl(): Promise<string> {
  return new Promise<string>((resolve) => {
    chrome.tabs.query({
      active: true,
      currentWindow: true,
    }, (tabs) => resolve(tabs[0].url));
  });
}
