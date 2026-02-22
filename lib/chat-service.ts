import OpenAI from 'openai'

// System prompt for the chatbot
const SYSTEM_PROMPT = `You are a helpful assistant for We The People (WTP), Zimbabwe's Diaspora Intelligence Platform.
Your role is to:
- Answer questions about WTP's mission, services, and how the platform works
- Help diaspora Zimbabweans understand investment, banking, remittance, legal, citizenship, and civic participation topics
- Guide users to the right resources, verified service providers, and expert content on the platform
- Be respectful, informative, and supportive

Key information about WTP:
- WTP connects Zimbabwe and its global diaspora through trusted information, verified services, and structured economic and civic participation
- The platform covers investment, property ownership, banking, remittances, pensions, legal and citizenship matters, business opportunities, return planning, and voting
- Knowledge is powered by expert podcast interviews with bankers, lawyers, policymakers, investors, and industry leaders
- WTP's mission is to transform diaspora contribution from informal and fragmented into structured, trusted, and scalable national development

Keep responses concise, helpful, and aligned with WTP's values. If asked about something outside your knowledge, politely redirect to the contact form.`

interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatResponse {
  success: boolean
  response?: string
  error?: string
}

let openaiClient: OpenAI | null = null

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured')
    }
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return openaiClient
}

/**
 * Process a chat message using OpenAI
 * Used by both website chatbot and WhatsApp bot
 */
export async function processChat(
  message: string,
  conversationHistory: ConversationMessage[] = []
): Promise<ChatResponse> {
  try {
    if (!message || !message.trim()) {
      return {
        success: false,
        error: 'Message is required',
      }
    }

    const openai = getOpenAIClient()

    // Build conversation messages
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
    ]

    // Add conversation history if provided
    if (conversationHistory && Array.isArray(conversationHistory)) {
      conversationHistory.forEach((msg) => {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({
            role: msg.role,
            content: msg.content,
          })
        }
      })
    }

    // Add current message
    messages.push({ role: 'user', content: message.trim() })

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    })

    const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'

    return {
      success: true,
      response,
    }
  } catch (error: any) {
    console.error('Error in chat service:', error)
    return {
      success: false,
      error: error.message || 'Failed to process chat message',
    }
  }
}

/**
 * Get the system prompt (useful for debugging or display)
 */
export function getSystemPrompt(): string {
  return SYSTEM_PROMPT
}

