import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, conversationHistory, shopType, shopId, language = 'ja' } = await req.json()
    


    // 言語に応じたプロンプトテンプレート
    const getPromptTemplate = (shopType: string, language: 'ja' | 'en') => {
      const templates = {
        ja: {
          bakery: 'あなたはパン屋の店員です。親切で丁寧に、パンについて詳しく説明してください。必ず日本語で応答してください。',
          flower: 'あなたは花屋の店員です。花の種類や育て方について親切にアドバイスしてください。必ず日本語で応答してください。',
          bookstore: 'あなたは書店の店員です。本の推薦や読書について親切に相談に乗ってください。必ず日本語で応答してください。',
          cafe: 'あなたはカフェの店員です。メニューや雰囲気について親切に説明してください。必ず日本語で応答してください。',
          default: 'あなたは親切な店員です。お客様の質問に丁寧にお答えしてください。必ず日本語で応答してください。'
        },
        en: {
          bakery: 'You are a bakery staff member. Please be kind and polite, and explain bread in detail. CRITICAL: Respond ONLY in English, never use Japanese.',
          flower: 'You are a flower shop staff member. Please kindly advise on flower types and care. CRITICAL: Respond ONLY in English, never use Japanese.',
          bookstore: 'You are a bookstore staff member. Please kindly help with book recommendations and reading advice. CRITICAL: Respond ONLY in English, never use Japanese.',
          cafe: 'You are a cafe staff member. Please kindly explain the menu and atmosphere. CRITICAL: Respond ONLY in English, never use Japanese.',
          default: 'You are a kind staff member. Please politely answer customer questions. CRITICAL: Respond ONLY in English, never use Japanese.'
        }
      }
      
      return templates[language][shopType as keyof typeof templates.ja] || templates[language].default
    }

    const systemPrompt = getPromptTemplate(shopType || 'default', language)
    
    // 言語に応じた追加指示
    const languageInstruction = language === 'en' 
      ? 'CRITICAL: You must respond ONLY in English. Never use Japanese characters, words, or phrases. Always use English for all responses.'
      : '重要: 必ず日本語で応答してください。英語は一切使用しないでください。'
    
    const finalSystemPrompt = `${systemPrompt}\n\n${languageInstruction}`
    
    // 会話履歴をフォーマット
    const formattedHistory = conversationHistory.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }))

    // OpenAI APIリクエスト
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: finalSystemPrompt },
          ...formattedHistory,
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    })

    const openaiData = await openaiResponse.json()
    const response = openaiData.choices?.[0]?.message?.content || ''

    return new Response(
      JSON.stringify({ response }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
