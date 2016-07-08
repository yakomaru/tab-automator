import _ from 'lodash';

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
      const storage = data.storage;
      const existingTabIds = arr.reduce((obj, tab) => {
        obj[tab.id] = true;
        return obj;
      }, {});
      const tabsToRemove = [];

      arr.forEach((tab) => {
        if (!storage[tab.id]) storage[tab.id] = {};

        const tabData = storage[tab.id];

        if (tab.pinned) return;

        if (!tabData.open) {
          tabData.open = Date.now();
          storage[tab.id].open = tabData.open;
        }

        if (tabData.open < Date.now() - (1000 * 60 * 60 * 24)) {
          tabsToRemove.push(tab.id);
          delete storage[tab.id];
        }
      });

      chrome.tabs.remove(tabsToRemove);

      _.forEach(storage, (value, key) => {
        if (!existingTabIds[key]) {
          delete storage[key];
        }
      });

      console.log(storage);

      chrome.storage.local.set({ storage });
    });
  });
}, 1000 * 10);

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.storage.local.get('storage', (data) => {
    const storage = data.storage;

    if (!storage[activeInfo.tabId]) {
      storage[activeInfo.tabId] = {};
    }

    storage[activeInfo.tabId].open = Date.now();

    chrome.storage.local.set({ storage });
  });
});
