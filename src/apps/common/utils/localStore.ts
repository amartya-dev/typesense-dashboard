export const LocalStore = {
  // Add an item
  // By default the value will expire in 5 minutes
  add: (key: string, value: Object, expires: number = 300) => {
    const storageValue = {
      value: value,
      expirationTime: new Date().getTime() + expires * 1000,
    };
    localStorage.setItem(key, JSON.stringify(storageValue));
  },

  get: (key: string) => {
    const storedValue = localStorage.getItem(key);
    if (!storedValue) {
      return null;
    }
    try {
      const stored = JSON.parse(storedValue);
      if (stored.expirationTime < new Date().getTime()) {
        // Clear this item and return null
        localStorage.removeItem(key);
        return null;
      }
      return stored.value;
    } catch (err) {
      console.log("Could not parse JSON");
      return null;
    }
  },
};
