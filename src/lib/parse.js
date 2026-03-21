import Parse from "parse/node";

const APP_ID = process.env.NEXT_PUBLIC_BACK4APP_APP_ID || "";
const JS_KEY = process.env.NEXT_PUBLIC_BACK4APP_JS_KEY || "";
const SERVER_URL =
  process.env.NEXT_PUBLIC_BACK4APP_SERVER_URL ||
  "https://parseapi.back4app.com";

// Avoid re-initializing on hot reload
if (typeof window !== "undefined") {
  if (!window.__parseInitialized) {
    Parse.initialize(APP_ID, JS_KEY);
    Parse.serverURL = SERVER_URL;
    window.__parseInitialized = true;
  }
} else {
  Parse.initialize(APP_ID, JS_KEY);
  Parse.serverURL = SERVER_URL;
}

export default Parse;
