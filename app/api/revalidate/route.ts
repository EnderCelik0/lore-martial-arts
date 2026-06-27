import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";

// Body: { secret: string, slug: string, language: string }
export async function POST(request: NextRequest) {
  let body: { secret?: string; slug?: string; language?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz gövde" }, { status: 400 });
  }

  const { secret, slug = "", language } = body;

  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  if (language !== "tr" && language !== "en") {
    return NextResponse.json({ error: "Geçersiz dil" }, { status: 400 });
  }

  const path = slug ? `/${language}/${slug}` : `/${language}`;
  revalidatePath(path);

  return NextResponse.json({ revalidated: true, path });
}
