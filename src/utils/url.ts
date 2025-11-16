export function getQueryParam(key: string): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
}

export function setQueryParam(key: string, value: string | null) {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  const params = url.searchParams;

  if (value === null) {
    params.delete(key);
  } else {
    params.set(key, value);
  }

  // update URL without reloading the page
  window.history.replaceState({}, "", `${url.pathname}?${params.toString()}`);
}
