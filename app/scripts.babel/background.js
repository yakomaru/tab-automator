import _ from 'lodash';
import Promise from 'bluebird';

chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});

chrome.browserAction.setBadgeText({ text: '\'Allo' });

console.log('\'Allo \'Allo! Event Page for Browser Action');

const getAllTabs = () => (
  new Promise((resolve) => {
    chrome.tabs.query({}, (tabs) => {
      resolve(tabs);
    });
  })
);

const getStorage = () => (
  new Promise((resolve) => {
    chrome.storage.local.get('storage', (data) => {
      resolve(data.storage);
    });
  })
);

const updateActiveTab = (activeInfo, storage) => {
  if (!storage[activeInfo.tabId]) {
    storage[activeInfo.tabId] = {};
  }

  storage[activeInfo.tabId].open = Date.now();
};

const removeOldTabs = (tabs, storage) => {
  const existingTabIds = tabs.reduce((obj, tab) => {
    obj[tab.id] = true;

    return obj;
  }, {});
  const tabsToRemove = [];

  tabs = tabs.filter((tab) => {
    return !tab.pinned && !tab.active;
  });

  tabs.sort((a, b) => {
    const tabDataA = storage[a.id];
    const tabDataB = storage[b.id];
    return tabDataA.open - tabDataB.open;
  });
console.log(tabs);
  tabs.forEach((tab) => {
    if (!storage[tab.id]) storage[tab.id] = {};

    const tabData = storage[tab.id];

    if (!tabData.open) {
      tabData.open = Date.now();

      storage[tab.id].open = tabData.open;
    }

    if (tabData.open < Date.now() - (1000 * 60 * 60 * 24) &&
      tabs.length - tabsToRemove.length > 5) {
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
};

chrome.tabs.onActivated.addListener((activeInfo) => {
  let tabs = [];
  let storage = {};

  getAllTabs().then((data) => {
    tabs = data;

    return getStorage();
  }).then((data) => {
    storage = data;

    console.log(new Date(), tabs, storage);

    updateActiveTab(activeInfo, storage);

    removeOldTabs(tabs, storage);

    chrome.storage.local.set({ storage });
  });
});
