// 画像生成API - Replicate (Nanobanana Pro) 経由
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
    const { prompt, apiKey } = JSON.parse(event.body);

    if (!prompt || !apiKey) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'プロンプトまたはAPIキーがありません' })
      };
    }

    // Create prediction using model name format
    const createResponse = await fetch('https://api.replicate.com/v1/models/google-deepmind/imagen-4/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait'
      },
      body: JSON.stringify({
        input: {
          prompt: prompt,
          aspect_ratio: "16:9",
          output_format: "png",
          safety_filter_level: "block_only_high"
        }
      })
    });

    if (!createResponse.ok) {
      const error = await createResponse.json();
      console.error('Replicate create error:', error);
      throw new Error(error.detail || 'Replicate API Error');
    }

    let prediction = await createResponse.json();

    // Poll for completion (max 60 seconds)
    const maxAttempts = 30;
    let attempts = 0;

    while (prediction.status !== 'succeeded' && prediction.status !== 'failed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const pollResponse = await fetch(prediction.urls.get, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      
      prediction = await pollResponse.json();
      attempts++;
    }

    if (prediction.status === 'failed') {
      throw new Error(prediction.error || 'Image generation failed');
    }

    if (prediction.status !== 'succeeded') {
      throw new Error('Image generation timed out');
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        url: Array.isArray(prediction.output) ? prediction.output[0] : prediction.output 
      })
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
