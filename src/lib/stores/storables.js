import { writable, readonly, get } from 'svelte/store';
import { isBrowser } from '$lib/utils.js';

/**
 * @param {string} name
 * @param {(any) => Promise<any>} refreshFun
 */
export function refreshableStore(name, refreshFun) {
  const parentStore = persistentStore(name, { data: null });

  function appendRefreshTime(data) {
    return { lastRefreshedAt: Date.now(), data };
  }

  function subscribe(cb) {
    return parentStore.subscribe((value) => cb(value.data));
  }

  function set(data) {
    parentStore.set(appendRefreshTime(data));
  }

  function update(cb) {
    const _cb = (data) => appendRefreshTime(cb(data));
    parentStore.update(_cb);
  }

  async function refresh() {
    return refreshFun(get(parentStore).data)
      .then((data) => {
        set(data);
        console.debug(`Store ${name} refreshed:`, data);
      })
      .catch((err) => {
        console.error(`Store ${name} refresh failed`, err);
      });
  }

  return {
    subscribe,
    set,
    update,
    refresh,
    get refreshTime() {
      const { subscribe, set, update } = readonly(parentStore);
      return {
        subscribe: (cb) => subscribe((value) => cb(value.lastRefreshedAt)),
        set,
        update,
      };
    },
  };
}

export function persistentStore(name, value = null) {
  const parentStore = writable(value);

  if (isBrowser()) {
    if (name in localStorage) {
      parentStore.set(JSON.parse(localStorage.getItem(name)));
    }
    parentStore.subscribe((v) => localStorage.setItem(name, JSON.stringify(v)));
  }

  return parentStore;
}
