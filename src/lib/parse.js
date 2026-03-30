import Parse from "parse/react-native.js";

const APP_ID = process.env.NEXT_PUBLIC_BACK4APP_APP_ID || "";
const JS_KEY = process.env.NEXT_PUBLIC_BACK4APP_JS_KEY || "";
const SERVER_URL =
  process.env.NEXT_PUBLIC_BACK4APP_SERVER_URL ||
  "https://parseapi.back4app.com";

// Only initialize in the browser — all Parse usage is in "use client" components
if (typeof window !== "undefined" && !window.__parseInitialized) {
  Parse.initialize(APP_ID, JS_KEY);
  Parse.serverURL = SERVER_URL;
  window.__parseInitialized = true;
}

export default Parse;
