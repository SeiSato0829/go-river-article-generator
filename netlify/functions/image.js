// 画像生成API - Pollinations AI（完全無料・APIキー不要）
export async function handler(event) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }

  try {
    const { prompt } = JSON.parse(event.body);

    if (!prompt) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'プロンプトがありません' })
      };
    }

    // Pollinations AI - 完全無料・APIキー不要
    // URLエンコードしてリクエスト
    const encodedPrompt = encodeURIComponent(prompt);
    const width = 1024;
    const height = 576; // 16:9 aspect ratio
    const seed = Math.floor(Math.random() * 1000000);

    // Pollinations AIのURL形式
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true`;

    // 画像が生成されるか確認（HEADリクエスト）
    const checkResponse = await fetch(imageUrl, { method: 'HEAD' });

    if (!checkResponse.ok) {
      throw new Error('画像生成に失敗しました');
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ url: imageUrl })
    };

  } catch (error) {
    console.error('Image generation error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
}
