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

    const code = generateCode();
    const expires = Date.now() + 10 * 60 * 1000;
    pendingCodes.set(email.toLowerCase(), { code, expires, name: name || '' });

    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');

    if (smtpHost && smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
      });

      await transporter.sendMail({
        from: `"CozyJet Studio" <${smtpUser}>`,
        to: email,
        subject: 'Your CozyJet Verification Code',
        html: `
          <div style="font-family: 'Courier New', monospace; max-width: 480px; margin: 0 auto; background: #050814; color: #fff; padding: 40px; border-radius: 16px; border: 1px solid rgba(139,92,246,0.3);">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="font-size: 28px; font-weight: 800; color: #fff; letter-spacing: -0.02em; margin: 0;">CozyJet</h1>
              <p style="color: rgba(255,255,255,0.4); font-size: 12px; margin-top: 8px; text-transform: uppercase; letter-spacing: 0.2em;">AI AGENTIC STUDIO</p>
            </div>
            <p style="color: rgba(255,255,255,0.7); font-size: 15px; margin-bottom: 8px;">Hi ${name || 'there'},</p>
            <p style="color: rgba(255,255,255,0.5); font-size: 14px; line-height: 1.6; margin-bottom: 32px;">Your verification code for CozyJet Studio. This code expires in 10 minutes.</p>
            <div style="background: rgba(139,92,246,0.12); border: 1px solid rgba(139,92,246,0.3); border-radius: 12px; padding: 28px; text-align: center; margin-bottom: 32px;">
              <p style="color: rgba(255,255,255,0.4); font-size: 11px; text-transform: uppercase; letter-spacing: 0.3em; margin: 0 0 12px 0;">Verification Code</p>
              <p style="font-size: 40px; font-weight: 900; letter-spacing: 0.15em; color: #a78bfa; margin: 0;">${code}</p>
            </div>
            <p style="color: rgba(255,255,255,0.25); font-size: 12px; text-align: center;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        `,
      });

      return NextResponse.json({ success: true, sent: true });
    } else {
      return NextResponse.json({ success: true, sent: false, devCode: code });
    }
  } catch (error) {
    console.error('Send verification error:', error);
    return NextResponse.json({ error: 'Failed to send code' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email') || '';
  const code = req.nextUrl.searchParams.get('code') || '';
  const entry = pendingCodes.get(email.toLowerCase());

  if (!entry) return NextResponse.json({ valid: false, reason: 'No code found' });
  if (Date.now() > entry.expires) {
    pendingCodes.delete(email.toLowerCase());
    return NextResponse.json({ valid: false, reason: 'Code expired' });
  }
  if (entry.code !== code) return NextResponse.json({ valid: false, reason: 'Wrong code' });

  pendingCodes.delete(email.toLowerCase());
  return NextResponse.json({ valid: true });
}
