const _proxy = new Proxy(
  {},
  {
    get(_, key) {
      return localStorage.getItem(key);
    },

    set(_, key, value) {
      localStorage.setItem(key, value);
      return true;
    },
  }
);

export default {
  // TODO: That's so ugly...
  get items() {
    return _proxy;
  },

  exists(key) {
    return key in localStorage;
  },

  delete(key) {
    localStorage.removeItem(key);
  },
};
