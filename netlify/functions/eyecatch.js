// アイキャッチ画像生成API - Replicate (Flux) 使用
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
    const { articleTitle, apiKey } = JSON.parse(event.body);

    if (!articleTitle || !apiKey) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: '記事タイトルまたはAPIキーがありません' })
      };
    }

    // Generate image prompt from article title
    const imagePrompt = `Professional business blog header image for an article titled "${articleTitle}". Modern, clean design with abstract geometric shapes, soft gradients in blue and purple tones. No text in image. Corporate, professional aesthetic. High quality, 16:9 aspect ratio.`;

    // Call Replicate API (Flux model)
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: 'black-forest-labs/flux-schnell',
        input: {
          prompt: imagePrompt,
          num_outputs: 1,
          aspect_ratio: '16:9',
          output_format: 'webp',
          output_quality: 90
        }
      })
    });

    const prediction = await response.json();

    if (!response.ok) {
      throw new Error(prediction.detail || 'Replicate API error');
    }

    // Poll for result
    let result = prediction;
    let attempts = 0;
    const maxAttempts = 30;

    while (result.status !== 'succeeded' && result.status !== 'failed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const pollResponse = await fetch(result.urls.get, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      result = await pollResponse.json();
      attempts++;
    }

    if (result.status === 'failed') {
      throw new Error('Image generation failed');
    }

    const imageUrl = result.output?.[0] || result.output;

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ imageUrl })
    };

  } catch (error) {
    console.error('Eyecatch generation error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message })
    };
  }
}
