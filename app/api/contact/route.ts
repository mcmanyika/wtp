import { NextRequest, NextResponse } from 'next/server'
import { createContactSubmission } from '@/lib/firebase/firestore'

export async function POST(request: NextRequest) {
  try {
    const { name, email, message, userId } = await request.json()

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    if (!email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Create contact submission
    await createContactSubmission({
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      userId: userId || undefined,
    })

    return NextResponse.json(
      { success: true, message: 'Contact form submitted successfully' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error processing contact form:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to submit contact form' },
      { status: 500 }
    )
  }
}

