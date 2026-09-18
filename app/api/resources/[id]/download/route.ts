import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSignedUrl } from "@/lib/storage/signed-url";

// Resolves a resource's protected download link. RLS on `resources` already
// enforces visibility (public/members/admin) for the SELECT below, so if the
// row comes back, the caller is authorized to have it. Public-visibility
// resources with an external file_url just redirect; private-bucket ones get
// a short-lived signed URL — the raw bucket path is never exposed directly.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: resource, error } = await supabase.from("resources").select("*").eq("id", id).single();
  if (error || !resource) {
    return NextResponse.json({ error: "Not found or not authorized." }, { status: 404 });
  }

  if (resource.file_url.startsWith("http")) {
    return NextResponse.redirect(resource.file_url);
  }

  try {
    const signedUrl = await getSignedUrl("resources", resource.file_url);
    return NextResponse.redirect(signedUrl);
  } catch {
    return NextResponse.json({ error: "Could not generate download link." }, { status: 500 });
  }
}
