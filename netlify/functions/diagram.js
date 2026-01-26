// 図解SVG生成API - Gemini使用（改善版）
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

    const prompt = `あなたはSVG図解の専門家です。以下の内容をSVGで図解してください。

【図解内容】
${content}

【SVG作成ルール】
- サイズ: width="800" height="450"
- フォント: Noto Sans JP（font-family="Noto Sans JP, sans-serif"）
- 色: 青=#2563eb、緑=#10b981、グレー=#6b7280、白=#ffffff
- 背景: 薄いグレー(#f8fafc)の角丸四角形
- タイトル: 中央上部、24px、太字
- 内容: カード形式で整理して表示
- カード: 白背景、角丸8px、影効果（filter）

【重要】
- マークダウンのコードブロック(\`\`\`)は絶対に使わないでください
- <svg>タグから直接始めて</svg>で終わってください
- 日本語テキストをそのまま含めてください
- 説明文は不要、SVGコードのみ出力

SVGコード:`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 8192
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Gemini API error');
    }

    let svg = data.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || '';

    // コードブロックを除去（念のため）
    svg = svg.replace(/```svg\s*/gi, '');
    svg = svg.replace(/```\s*/gi, '');
    svg = svg.trim();

    // SVGタグを抽出
    const svgMatch = svg.match(/<svg[\s\S]*<\/svg>/i);
    if (svgMatch) {
      svg = svgMatch[0];
    }

    // SVGが有効かチェック
    if (!svg.includes('<svg') || !svg.includes('</svg>')) {
      throw new Error('有効なSVGが生成されませんでした');
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
