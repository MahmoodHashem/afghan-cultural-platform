const defaultPersianNumberFormatter = new Intl.NumberFormat("fa-AF");
const mediumPersianDateFormatter = new Intl.DateTimeFormat("fa-AF", {
  dateStyle: "medium",
});

function formatPersianNumber(value: number, options?: Intl.NumberFormatOptions) {
  if (options) {
    return new Intl.NumberFormat("fa-AF", options).format(value);
  }

  return defaultPersianNumberFormatter.format(value);
}

function formatPersianDate(value: string | Date) {
  return mediumPersianDateFormatter.format(typeof value === "string" ? new Date(value) : value);
}

export { formatPersianDate, formatPersianNumber };
