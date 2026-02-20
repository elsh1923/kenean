import { cookies } from "next/headers";
import { Language, i18nDict } from "./i18n";

export async function getServerLanguage(): Promise<Language> {
  const cookieStore = await cookies();
  const lang = cookieStore.get("kenean-language")?.value as Language;
  if (lang === "en" || lang === "am" || lang === "gz") {
    return lang;
  }
  return "en";
}

export async function getServerDict() {
  const lang = await getServerLanguage();
  return i18nDict[lang];
}
