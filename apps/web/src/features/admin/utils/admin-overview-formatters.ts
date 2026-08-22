const shortDateFormatter = new Intl.DateTimeFormat("fa-AF", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

const relativeTimeFormatter = new Intl.RelativeTimeFormat("fa-AF", { numeric: "auto" });

function formatAdminChartDate(value: string) {
  return shortDateFormatter.format(new Date(`${value}T00:00:00.000Z`));
}

function formatAdminRelativeTime(value: string, now = new Date()) {
  const date = new Date(value);
  const differenceSeconds = Math.round((date.getTime() - now.getTime()) / 1000);
  const absoluteSeconds = Math.abs(differenceSeconds);

  if (absoluteSeconds < 60) {
    return relativeTimeFormatter.format(differenceSeconds, "second");
  }

  if (absoluteSeconds < 60 * 60) {
    return relativeTimeFormatter.format(Math.round(differenceSeconds / 60), "minute");
  }

  if (absoluteSeconds < 24 * 60 * 60) {
    return relativeTimeFormatter.format(Math.round(differenceSeconds / (60 * 60)), "hour");
  }

  return relativeTimeFormatter.format(Math.round(differenceSeconds / (24 * 60 * 60)), "day");
}

export { formatAdminChartDate, formatAdminRelativeTime };
