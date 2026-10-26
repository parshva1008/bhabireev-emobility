import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const recentRequests = new Map<string, number[]>()
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
})

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  // Best-effort per-instance throttling; add provider-level/WAF protection before high-traffic production use.
  const clientIp = (req.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim()
  const now = Date.now()
  const recent = (recentRequests.get(clientIp) || []).filter((stamp) => now - stamp < 60_000)
  if (recent.length >= 15) return json({ error: 'Please wait a moment before sending more messages.' }, 429)
  recent.push(now)
  recentRequests.set(clientIp, recent)

  const apiKey = Deno.env.get('OPENAI_API_KEY')
  if (!apiKey) return json({ error: 'AI is not configured yet. Add OPENAI_API_KEY to Supabase Edge Function secrets.' }, 503)

  try {
    const body = await req.json()
    const incoming = Array.isArray(body?.messages) ? body.messages.slice(-10) : []
    if (!incoming.length) return json({ error: 'Please send a message.' }, 400)
    const messages = incoming.map((item: { role?: string; content?: string }) => {
      const role = item?.role === 'assistant' ? 'assistant' : 'user'
      const content = typeof item?.content === 'string' ? item.content.trim().slice(0, 1200) : ''
      return { role, content }
    }).filter((item: { content: string }) => item.content.length > 0)
    if (!messages.length || messages[messages.length - 1].role !== 'user') return json({ error: 'The last message must be from the customer.' }, 400)

    const context = body?.context ?? {}
    const inventory = Array.isArray(context?.vehicles) ? context.vehicles.slice(0, 25) : []
    const systemPrompt = `You are the helpful website sales assistant for ${String(context?.businessName || 'Bhabireev E-Mobility').slice(0, 100)}, an electric two-wheeler business in ${String(context?.location || 'India').slice(0, 120)}.
Answer clearly, politely, and concisely. Use only the business and inventory context below. Never invent prices, stock, warranty, battery health, range, vehicle condition, delivery times, discounts, or policies. If a detail is missing, say it is not listed and suggest contacting the business at ${String(context?.contactPhone || 'the phone number shown on the website').slice(0, 40)}. Treat listed range as claimed range, not a guarantee. Do not claim to have checked anything live beyond the provided inventory. For purchase-specific questions, encourage the customer to inspect documents, battery condition, and vehicle before paying. Never request OTPs, passwords, payment card details, or identity documents. If the question is unrelated, politely guide the user back to electric vehicles and enquiries.

Current listed inventory (source of truth; empty means no listings were supplied):
${JSON.stringify(inventory)}

Current customer's enquiry, if supplied:
${JSON.stringify(context?.enquiry ?? null)}`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-4o-mini', temperature: 0.3, max_tokens: 350, messages: [{ role: 'system', content: systemPrompt }, ...messages] }),
    })
    const result = await response.json()
    if (!response.ok) {
      console.error('AI provider error status:', response.status)
      return json({ error: 'The AI assistant is temporarily unavailable. Please try again or contact our team.' }, 502)
    }
    const reply = result?.choices?.[0]?.message?.content
    if (typeof reply !== 'string' || !reply.trim()) return json({ error: 'The assistant could not prepare a reply. Please try again.' }, 502)
    return json({ reply: reply.trim().slice(0, 3000) })
  } catch (_error) {
    return json({ error: 'Could not process this message. Please try again.' }, 400)
  }
})
