import { getMessage } from "@src/utils/i18n";

/** Chess Roadmap link with UTM tags, so visits from the extension show up in the site's analytics. */
export function chessRoadmapUrl(placement: "options" | "popup"): string {
  const base = getMessage("chessRoadmapUrl");
  const url = new URL(base.startsWith("http") ? base : "https://thechessroadmap.vercel.app/");
  url.searchParams.set("utm_source", "lichess4chess");
  url.searchParams.set("utm_medium", "extension");
  url.searchParams.set("utm_campaign", placement);
  return url.toString();
}
