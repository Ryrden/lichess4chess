import Browser from "webextension-polyfill";

export function getMessage(key: string): string {
  return Browser.i18n.getMessage(key) || key;
}