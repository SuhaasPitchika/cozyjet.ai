import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const pendingCodes = new Map<string, { code: string; expires: number; name: string }>();

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

    const emailKey = email.toLowerCase().trim();
    const code = generateCode();
    const expires = Date.now() + 10 * 60 * 1000;
    pendingCodes.set(emailKey, { code, expires, name: name || '' });

    const gmailPass = process.env.GMAIL_APP_PASSWORD;

    if (gmailPass) {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'cozyjetai@gmail.com',
          pass: gmailPass.trim(),
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      try {
        await transporter.sendMail({
          from: '"CozyJet Studio" <cozyjetai@gmail.com>',
          to: email.trim(),
          subject: 'Your CozyJet Verification Code',
          html: `
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #ffffff; color: #111; padding: 40px; border-radius: 16px; border: 1px solid #e5e7eb;">
              <div style="text-align: center; margin-bottom: 32px;">
                <h1 style="font-size: 26px; font-weight: 800; color: #111; letter-spacing: -0.02em; margin: 0;">CozyJet</h1>
                <p style="color: #6b7280; font-size: 12px; margin-top: 6px; text-transform: uppercase; letter-spacing: 0.2em;">AI AGENTIC STUDIO</p>
              </div>
              <p style="color: #374151; font-size: 15px; margin-bottom: 8px;">Hi ${name || 'there'},</p>
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-bottom: 32px;">Your verification code for CozyJet Studio. This code expires in <strong>10 minutes</strong>.</p>
              <div style="background: #f0f9ff; border: 2px solid #bae6fd; border-radius: 12px; padding: 28px; text-align: center; margin-bottom: 32px;">
                <p style="color: #0369a1; font-size: 11px; text-transform: uppercase; letter-spacing: 0.3em; margin: 0 0 12px 0; font-weight: 700;">Your Verification Code</p>
                <p style="font-size: 44px; font-weight: 900; letter-spacing: 0.3em; color: #2563eb; margin: 0; font-family: 'Courier New', monospace;">${code}</p>
              </div>
              <p style="color: #9ca3af; font-size: 12px; text-align: center;">If you didn't request this, you can safely ignore this email.</p>
            </div>
          `,
        });

        console.log('[verify] Email sent to', email);
        return NextResponse.json({ success: true, sent: true });
      } catch (emailErr) {
        console.error('[verify] SMTP error:', emailErr);
        return NextResponse.json({ success: true, sent: false, devCode: code });
      }
    } else {
      console.warn('[verify] No GMAIL_APP_PASSWORD set. Dev mode, code:', code);
      return NextResponse.json({ success: true, sent: false, devCode: code });
    }
  } catch (error) {
    console.error('[verify] Send verification error:', error);
    return NextResponse.json({ error: 'Failed to send code' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const email = (req.nextUrl.searchParams.get('email') || '').toLowerCase().trim();
  const code = req.nextUrl.searchParams.get('code') || '';
  const entry = pendingCodes.get(email);

  if (!entry) return NextResponse.json({ valid: false, reason: 'No code found' });
  if (Date.now() > entry.expires) {
    pendingCodes.delete(email);
    return NextResponse.json({ valid: false, reason: 'Code expired' });
  }
  if (entry.code !== code) return NextResponse.json({ valid: false, reason: 'Wrong code' });

  pendingCodes.delete(email);
  return NextResponse.json({ valid: true });
}
