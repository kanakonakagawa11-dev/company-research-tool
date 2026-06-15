import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  const { data, error } = await supabase
    .from("reports")
    .select("id, company_name, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: "レポート一覧の取得に失敗しました" }, { status: 500 });
  }

  return NextResponse.json({ reports: data });
}
