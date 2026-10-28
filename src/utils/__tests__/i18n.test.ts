import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { LANGUAGE_FLAGS, LANGUAGES, languageAfterUpdate, resolveLanguage } from "../i18n";

// Vitest runs from the project root.
const LOCALES_DIR = resolve(process.cwd(), "src/locales");

type Messages = Record<string, { message: string; description?: string; placeholders?: unknown }>;

function readMessages(code: string): Messages {
  return JSON.parse(readFileSync(join(LOCALES_DIR, code, "messages.json"), "utf8"));
}

const tokens = (text: string) => [...text.matchAll(/\$[A-Z_]+\$/g)].map((match) => match[0]).sort();

describe("resolveLanguage", () => {
  it.each([
    ["en-US", "en"],
    ["pt-BR", "pt_br"],
    ["pt", "pt_br"],
    ["pt-PT", "pt_br"],
    ["pt_BR", "pt_br"],
    ["es", "es"],
    ["es-419", "es"],
    ["fr-CA", "fr"],
    ["ru", "ru"],
    ["de-DE", "en"],
    ["", "en"],
    [undefined, "en"],
  ])("maps %s to %s", (tag, expected) => {
    expect(resolveLanguage(tag)).toBe(expected);
  });
});

describe("languageAfterUpdate", () => {
  it.each([
    ["0.8.0", "en", "ru", "ru"],
    ["0.8.0", "en", "fr-CA", "fr"],
    ["0.7.3", "en", "es-419", "es"],
    ["0.8.0", "en", "en-US", null],
    ["0.8.0", "en", "pt-BR", null],
    ["0.8.0", "pt_BR", "ru", null],
    ["0.9.0", "en", "ru", null],
    ["1.0.0", "en", "ru", null],
    [undefined, "en", "ru", null],
  ])("from %s with %s saved and a %s browser gives %s", (previous, saved, ui, expected) => {
    expect(languageAfterUpdate(previous, saved, ui)).toBe(expected);
  });
});

describe("locale files", () => {
  const codes = Object.keys(LANGUAGES);
  const english = readMessages("en");

  it("has one folder per supported language and nothing else", () => {
    const folders = readdirSync(LOCALES_DIR, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
    expect(folders.sort()).toEqual([...codes].sort());
  });

  it("has a flag for every supported language", () => {
    expect(Object.keys(LANGUAGE_FLAGS).sort()).toEqual([...codes].sort());
  });

  it.each(codes.filter((code) => code !== "en"))("%s has the same keys, placeholders and tokens as en", (code) => {
    const messages = readMessages(code);
    expect(Object.keys(messages).sort()).toEqual(Object.keys(english).sort());
    for (const [key, entry] of Object.entries(english)) {
      const translated = messages[key];
      expect(translated.message.trim(), `${code}: "${key}" is empty`).not.toBe("");
      expect(tokens(translated.message), `${code}: "${key}" placeholders`).toEqual(tokens(entry.message));
      expect(translated.placeholders, `${code}: "${key}" placeholders object`).toEqual(entry.placeholders);
    }
  });

  it.each(codes)("%s keeps the store summary within 132 characters", (code) => {
    expect(readMessages(code).extDescription.message.length).toBeLessThanOrEqual(132);
  });
});
