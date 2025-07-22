import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    // Supabaseクライアントを初期化
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // アップロードされたテキスト（ラグ）を取得
    let uploadedContent = ''
    if (shopId) {
      const { data: lags, error } = await supabase
        .from('shop_lags')
        .select('file_url, file_name')
        .eq('shop_id', shopId)

      if (!error && lags && lags.length > 0) {
        // ファイルの内容を取得
        for (const lag of lags) {
          try {
            const response = await fetch(lag.file_url)
            if (response.ok) {
              const content = await response.text()
              uploadedContent += content + '\n\n'
            }
          } catch (e) {
            console.error('Error fetching file:', e)
          }
        }
      }
    }

    // 店舗タイプに応じたプロンプト
    const getPromptTemplate = (shopType: string) => {
      const templates = {
        bakery: 'あなたはパン屋の店員です。親切で丁寧に、パンについて詳しく説明してください。',
        flower: 'あなたは花屋の店員です。花の種類や育て方について親切にアドバイスしてください。',
        bookstore: 'あなたは書店の店員です。本の推薦や読書について親切に相談に乗ってください。',
        cafe: 'あなたはカフェの店員です。メニューや雰囲気について親切に説明してください。',
        default: 'あなたは親切な店員です。お客様の質問に丁寧にお答えしてください。'
      }
      
      return templates[shopType as keyof typeof templates] || templates.default
    }

    const basePrompt = getPromptTemplate(shopType || 'default')
    
    // アップロードされたコンテンツがある場合は、それを参考資料として追加
    const systemPrompt = uploadedContent 
      ? `${basePrompt}\n\n参考資料:\n${uploadedContent}\n\n上記の参考資料を基に、お客様の質問にお答えしてください。`
      : basePrompt
    
    // 会話履歴をフォーマット
    const formattedHistory = conversationHistory.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }))

    // OpenAI APIリクエスト（ストリーミング）
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          ...formattedHistory,
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7,
        stream: true, // ストリーミングを有効化
      }),
    })

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`)
    }

    // ストリーミングレスポンスをそのまま転送
    const stream = new ReadableStream({
      async start(controller) {
        const reader = openaiResponse.body?.getReader()
        if (!reader) {
          controller.close()
          return
        }

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            // OpenAIのストリーミングデータをデコード
            const chunk = new TextDecoder().decode(value)
            const lines = chunk.split('\n')
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') {
                  controller.close()
                  return
                }
                
                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices?.[0]?.delta?.content
                  if (content) {
                    controller.enqueue(new TextEncoder().encode(content))
                  }
                } catch (e) {
                  // JSON解析エラーは無視
                }
              }
            }
          }
        } catch (error) {
          console.error('Streaming error:', error)
        } finally {
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      },
      status: 200,
    })

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
