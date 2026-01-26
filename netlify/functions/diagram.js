// 図解SVG生成API - Gemini使用（統一版）
export async function handler(event) {
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
    const { content, apiKey } = JSON.parse(event.body);

    if (!content || !apiKey) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: '図解内容またはAPIキーがありません' })
      };
    }

    const prompt = `以下の図解内容をSVGコードで作成してください。

## SVG作成ルール
1. 幅800px、高さ500px程度のSVGを作成
2. 日本語テキストを正確に表示（font-family: 'Noto Sans JP', sans-serif）
3. プロフェッショナルな配色（青系: #2563eb, #3b82f6、緑系: #10b981、グレー系: #6b7280）
4. 角丸の四角形、矢印、アイコン風の図形を使用
5. 読みやすいフォントサイズ（タイトル: 24px、本文: 16px）
6. 背景は白または薄いグラデーション

## 重要
- SVGコードのみを出力してください（説明文は不要）
- <svg>タグから始めて</svg>タグで終わること
- 文字が見切れないよう余白を確保すること

## 図解内容
${content}

SVGコードのみを出力してください：`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 4096
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Gemini API error');
    }

    let svg = data.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || '';

    // SVGタグのみを抽出
    const svgMatch = svg.match(/<svg[\s\S]*?<\/svg>/i);
    if (svgMatch) {
      svg = svgMatch[0];
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ svg })
    };

  } catch (error) {
    console.error('Diagram generation error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message })
    };
  }
}
