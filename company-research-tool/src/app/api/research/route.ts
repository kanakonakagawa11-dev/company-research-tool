import Anthropic from "@anthropic-ai/sdk";
import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  const { companyName } = await req.json();

  if (!companyName || typeof companyName !== "string") {
    return NextResponse.json({ error: "企業名を入力してください" }, { status: 400 });
  }

  const prompt = `
以下の企業について、Web検索を使って詳しく調査し、日本語でレポートをまとめてください。

企業名: ${companyName}

レポートには以下の項目を含めてください：

## 1. 基本情報
- 正式社名
- 設立年
- 本社所在地
- 代表者
- 従業員数
- 事業内容・主要製品・サービス

## 2. 財務・決算情報
- 最新の売上高・純利益
- 時価総額（上場企業の場合）
- 直近の決算ハイライト
- 業績トレンド

## 3. 最新ニュース・動向
- 直近の主要なニュースや発表
- 戦略的な動向

## 4. 総評
- 企業の強みと課題の簡潔なまとめ

情報が見つからない項目は「情報なし」と記載してください。
`.trim();

  let reportContent = "";

  try {
    const stream = await anthropic.messages.stream({
      model: "claude-opus-4-8",
      max_tokens: 4096,
      tools: [
        {
          type: "web_search_20260209",
          name: "web_search",
        } as Parameters<typeof anthropic.messages.stream>[0]["tools"][0],
      ],
      messages: [{ role: "user", content: prompt }],
    });

    const finalMessage = await stream.finalMessage();

    for (const block of finalMessage.content) {
      if (block.type === "text") {
        reportContent += block.text;
      }
    }
  } catch (err) {
    console.error("Claude API error:", err);
    return NextResponse.json(
      { error: "AI調査中にエラーが発生しました。しばらくしてから再試行してください。" },
      { status: 500 }
    );
  }

  const { data, error: dbError } = await supabase
    .from("reports")
    .insert({ company_name: companyName, content: reportContent })
    .select()
    .single();

  if (dbError) {
    console.error("Supabase error:", dbError);
    return NextResponse.json(
      { error: "レポートの保存に失敗しました", content: reportContent },
      { status: 500 }
    );
  }

  return NextResponse.json({ report: data });
}
