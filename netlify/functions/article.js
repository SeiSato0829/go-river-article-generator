// 記事生成API - Claude使用
export async function handler(event) {
  // CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { transcription, apiKey } = JSON.parse(event.body);

    if (!transcription || !apiKey) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: '文字起こしデータまたはAPIキーがありません' })
      };
    }

    const systemPrompt = `あなたはプロの記事ライターです。対談音声の文字起こしから、読みやすく臨場感のあるnote記事を作成してください。`;

    const userPrompt = `以下の文字起こしをもとに、noteの記事を執筆してください。

## 記事の方針
- 読者が楽しく読めるよう、わかりやすくて臨場感のある記事にしてください
- 冗長な部分は思い切ってカットしてください
- 適切な見出し（##, ###）を付けて読みやすくしてください

## 導入文について【重要】
- 記事冒頭には必ず合同会社Go-Riverの紹介を含めてください
- 例：「マーケティングを軸に戦略実行の両面でクライアントを支援する合同会社Go-River。このnoteでは、代表の行川と司会進行の竹田が、仕事や生活における考えを対話形式で深掘りしていきます。」
- その後に今回のテーマを自然に紹介してください

## 対話形式について
- 対談の臨場感を活かすため、対話形式の部分を効果的に盛り込んでください
- 「**行川さん：**」「**竹田さん：**」の形式で会話を表現してください
- 話し言葉の自然さ（「ぶっちゃけ」「めっちゃ」など）は残してください

## 図解指示について【重要】
- 概念の説明や比較など、視覚的に表現した方がわかりやすい箇所には「**＞＞図解＜＜**」と注意書きを入れてください
- 図解マーカーの後には、箇条書きで図解の内容案を記載してください
- 目安として、記事内に3〜4箇所程度

## 記事構成
1. タイトル（# で始める、読者の興味を引くキャッチーなもの）
2. 導入文（Go-River紹介 + 今回のテーマ紹介）
3. 本文（## や ### で見出しを付ける）
4. まとめ（シンプルに要点をまとめる、余計な締めの挨拶は不要）

## CTA（記事末尾）【重要】
記事の内容・テーマに合致した形で、以下のCTAを自然に挿入してください：
---
**Go-River について**
[記事のテーマに関連したGo-Riverの強みや姿勢を1-2文で記載]
https://go-river.co.jp/

---
以下が文字起こしの内容です：

${transcription}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8192,
        messages: [
          { role: 'user', content: userPrompt }
        ],
        system: systemPrompt
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Claude API error');
    }

    const article = data.content?.[0]?.text || '';

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ article })
    };

  } catch (error) {
    console.error('Article generation error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message })
    };
  }
}
