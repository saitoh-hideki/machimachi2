import { NextRequest, NextResponse } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const shopPrompts: Record<string, string> = {
  bookstore: 'あなたは親切で知識豊富な本屋の店主です。おすすめの本や読書の楽しみ方について詳しく答えてください。',
  bakery: 'あなたは明るく元気なパン屋の店主です。パンの種類や焼き方、美味しい食べ方について親しみやすく答えてください。',
  florist: 'あなたは優雅で花に詳しい花屋の店主です。花の種類やアレンジメント、花言葉について丁寧に答えてください。',
  // 必要に応じて他の商店も追加
};

export async function OPTIONS() {
  return NextResponse.json('ok', { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const { message, conversationHistory, shopType } = await req.json();
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return NextResponse.json({
        error: 'OpenAI API key not configured',
        response: '申し訳ございません。AIチャットの設定が完了していません。'
      }, {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    const systemPrompt = shopPrompts[shopType] ||
      'あなたはFractal Gridという階層的なグリッドベースのノードシステムのアシスタントです。ユーザーの質問に親切に答えてください。';
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []),
      { role: 'user', content: message }
    ];
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7
      })
    });
    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      return NextResponse.json({
        error: 'OpenAI API error',
        response: '申し訳ございません。AIチャットでエラーが発生しました。'
      }, {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || '申し訳ございません。応答を生成できませんでした。';
    return NextResponse.json({
      response: aiResponse,
      status: 'success'
    }, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Edge Function error:', error);
    return NextResponse.json({
      error: error.message,
      response: '申し訳ございません。AIチャットでエラーが発生しました。'
    }, {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
} 