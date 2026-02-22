import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/email'
import { createEmailLog } from '@/lib/firebase/firestore'

export async function POST(request: NextRequest) {
  try {
    const { email, name, userId } = await request.json()

    // Validation
    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const trimmedEmail = email.trim()
    const trimmedName = name.trim()
    const subject = 'Welcome to Diaspora Connect!'

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY is not configured. Skipping welcome email.')

      // Still log the attempt in the database
      try {
        await createEmailLog({
          type: 'welcome',
          to: trimmedEmail,
          name: trimmedName,
          subject,
          status: 'failed',
          error: 'RESEND_API_KEY not configured',
          userId: userId || undefined,
        })
      } catch (logErr) {
        console.error('Failed to log email attempt:', logErr)
      }

      return NextResponse.json(
        { success: true, message: 'Email service not configured, skipping.' },
        { status: 200 }
      )
    }

    const result = await sendWelcomeEmail({
      to: trimmedEmail,
      name: trimmedName,
    })

    // Store email record in database
    try {
      await createEmailLog({
        type: 'welcome',
        to: trimmedEmail,
        name: trimmedName,
        subject,
        status: result.success ? 'sent' : 'failed',
        resendId: result.id || undefined,
        error: result.success ? undefined : String(result.error || 'Unknown error'),
        userId: userId || undefined,
      })
    } catch (logErr) {
      console.error('Failed to log email:', logErr)
    }

    if (!result.success) {
      console.error('Failed to send welcome email:', result.error)
      return NextResponse.json(
        { success: false, message: 'Email could not be sent, but signup succeeded.' },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Welcome email sent successfully', id: result.id },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error in welcome email route:', error)
    return NextResponse.json(
      { success: false, message: 'Email service error, but signup succeeded.' },
      { status: 200 }
    )
  }
}
