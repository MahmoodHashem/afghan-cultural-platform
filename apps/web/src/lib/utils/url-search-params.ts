function setOptionalSearchParam(
  searchParams: URLSearchParams,
  key: string,
  value: boolean | number | string | undefined,
) {
  if (value !== undefined && value !== "") {
    searchParams.set(key, String(value));
  }
}

export { setOptionalSearchParam };
