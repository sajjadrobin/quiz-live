import Cookies from "universal-cookie";
const cookies = new Cookies();

class CookiesHelper {
  get(name) {
    return cookies.get(name);
  }

  set(name, value, options) {
    cookies.set(name, value, options);
  }
}

export default new CookiesHelper();
