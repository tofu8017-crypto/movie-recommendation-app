import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const tmdbPath = "/" + path.join("/");
  const searchParams = request.nextUrl.searchParams;

  const url = new URL(`https://api.themoviedb.org/3${tmdbPath}`);
  searchParams.forEach((value, key) => url.searchParams.set(key, value));
  if (!searchParams.has("language")) {
    url.searchParams.set("language", "ja");
  }

  const token = process.env.TMDB_API_READ_ACCESS_TOKEN;
  if (!token || token === "your_token_here") {
    return NextResponse.json(
      { error: "TMDB APIトークンが設定されていません" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { error: "TMDB APIへの接続に失敗しました" },
      { status: 502 }
    );
  }
}
