// 文字起こしAPI - Gemini使用
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
    const { audio, mimeType, apiKey } = JSON.parse(event.body);

    if (!audio || !apiKey) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: '音声データまたはAPIキーがありません' })
      };
    }

    const prompt = `添付した音声は、合同会社Go-Riverの行川（なめかわ）さんと竹田（たけだ）さんの対談音声です。
話者を分けて文字起こししてください。
文字起こしした内容で違和感のある点は、意味が通るように修正してください。

出力形式:
- 話者名: 発言内容
の形式で出力してください。`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: mimeType || 'audio/mp4', data: audio } }
            ]
          }],
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

    const transcription = data.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || '';

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ transcription })
    };

  } catch (error) {
    console.error('Transcription error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message })
    };
  }
}
