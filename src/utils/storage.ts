// src/utils/storage.js
export const storageGet = (keys) =>
    new Promise((resolve) => {
      if (chrome?.storage?.local) {
        chrome.storage.local.get(keys, (result) => resolve(result));
      } else {
        // fallback for dev (localStorage)
        const res = {};
        if (Array.isArray(keys)) {
          keys.forEach(k => (res[k] = JSON.parse(localStorage.getItem(k))));
        } else if (typeof keys === 'string') {
          res[keys] = JSON.parse(localStorage.getItem(keys));
        } else {
          Object.keys(keys).forEach(k => (res[k] = JSON.parse(localStorage.getItem(k))));
        }
        resolve(res);
      }
    });
  
  export const storageSet = (obj) =>
    new Promise((resolve) => {
      if (chrome?.storage?.local) {
        chrome.storage.local.set(obj, () => resolve());
      } else {
        Object.entries(obj).forEach(([k, v]) => localStorage.setItem(k, JSON.stringify(v)));
        resolve();
      }
    });
  