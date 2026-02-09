export async function tmdbClientFetch<T>(
  path: string,
  params?: Record<string, string>
): Promise<T> {
  const url = new URL(`/api/tmdb${path}`, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}
