function parseCookieHeader(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader.split(";").reduce<Record<string, string>>((cookies, cookiePart) => {
    const separatorIndex = cookiePart.indexOf("=");

    if (separatorIndex === -1) {
      return cookies;
    }

    const name = cookiePart.slice(0, separatorIndex).trim();
    const value = cookiePart.slice(separatorIndex + 1).trim();

    if (!name) {
      return cookies;
    }

    cookies[name] = decodeURIComponent(value);
    return cookies;
  }, {});
}

export { parseCookieHeader };
