// SessionStorageService.js

export default class SessionStorageService {
  static setItem(key, value) {
    try {
      const storeValue = typeof value === "string" ? value : JSON.stringify(value);
      sessionStorage.setItem(key, storeValue);
    } catch (err) {
      console.error(`Failed to set sessionStorage item '${key}':`, err);
    }
  }

  static getItem(key) {
    try {
      const value = sessionStorage.getItem(key);
      if (value === null) return null;

      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (err) {
      console.error(`Failed to get sessionStorage item '${key}':`, err);
      return null;
    }
  }

  static removeItem(key) {
    try {
      sessionStorage.removeItem(key);
    } catch (err) {
      console.error(`Failed to remove sessionStorage item '${key}':`, err);
    }
  }

  static clear() {
    try {
      sessionStorage.clear();
    } catch (err) {
      console.error("Failed to clear sessionStorage:", err);
    }
  }
}
