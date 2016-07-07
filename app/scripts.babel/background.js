chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});

chrome.browserAction.setBadgeText({ text: '\'Allo' });

console.log('\'Allo \'Allo! Event Page for Browser Action');

setInterval(() => {
  console.log(new Date());
  chrome.tabs.query({}, (arr) => {
    console.log(arr);
    chrome.storage.local.get('storage', (data) => {
      let storage = data.storage;
      console.log(storage);
      chrome.storage.local.set({ storage });
    });
  });
}, 10000);