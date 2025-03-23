import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateText, streamText } from 'ai'

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_AI_API_KEY || '',
})

export async function POST(req: Request) {
  const { prompt } = await req.json()
  console.log('API Prompt:', prompt)
  const model = google('gemini-2.0-flash-001')

  const { text } = await generateText({ model, prompt })

  console.log(text)
  return new Response(text)
}
