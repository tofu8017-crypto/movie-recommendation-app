const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export async function tmdbFetch<T>(
  path: string,
  params?: Record<string, string>,
  options?: { language?: string }
): Promise<T> {
  const url = new URL(`${TMDB_BASE_URL}${path}`);
  url.searchParams.set("language", options?.language ?? "ja-JP");

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  const token = process.env.TMDB_API_READ_ACCESS_TOKEN;
  if (!token || token === "your_token_here") {
    throw new Error(
      "TMDB_API_READ_ACCESS_TOKEN が設定されていません。.env.local を確認してください。"
    );
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
