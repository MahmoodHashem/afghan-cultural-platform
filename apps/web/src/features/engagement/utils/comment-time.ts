import { formatPersianDate } from "@/lib/utils/formatters";

const relativeTimeFormatter = new Intl.RelativeTimeFormat("fa-AF", { numeric: "auto" });

function formatCommentRelativeTime(value: string, now: number) {
  const differenceInSeconds = Math.round((new Date(value).getTime() - now) / 1000);
  const absoluteSeconds = Math.abs(differenceInSeconds);

  if (absoluteSeconds < 60) return relativeTimeFormatter.format(differenceInSeconds, "second");
  if (absoluteSeconds < 3600) {
    return relativeTimeFormatter.format(Math.round(differenceInSeconds / 60), "minute");
  }
  if (absoluteSeconds < 86_400) {
    return relativeTimeFormatter.format(Math.round(differenceInSeconds / 3600), "hour");
  }
  if (absoluteSeconds < 604_800) {
    return relativeTimeFormatter.format(Math.round(differenceInSeconds / 86_400), "day");
  }
  return formatPersianDate(value);
}

export { formatCommentRelativeTime };
