function normalizePersianCharacters(value: string) {
  return value.replaceAll("ي", "ی").replaceAll("ك", "ک");
}

function normalizePersianSearch(value: string) {
  return normalizePersianCharacters(value)
    .trim()
    .toLocaleLowerCase("fa-AF")
    .replace(/\u200c/g, " ")
    .replace(/\s+/g, " ");
}

function createPersianPathSegment(value: string) {
  return normalizePersianCharacters(value).trim().replace(/\s+/g, "-").replace(/-+/g, "-");
}

function normalizePersianRouteSegment(value: string) {
  return normalizePersianSearch(safeDecodeURIComponent(value).replace(/-/g, " "));
}

function safeDecodeURIComponent(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export {
  createPersianPathSegment,
  normalizePersianCharacters,
  normalizePersianRouteSegment,
  normalizePersianSearch,
  safeDecodeURIComponent,
};
