import express, { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// In-memory accounts storage & verification records
interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: 'client' | 'driver';
  isEmailVerified: boolean;
  email_verified_at: string | null;
  createdAt: string;
}

interface VerificationRecord {
  email: string;
  role: 'client' | 'driver';
  code: string;
  expiresAt: number; // timestamp ms
  lastSentAt: number;
  attempts: number;
}

const users: Map<string, RegisteredUser> = new Map(); // key: `${role}:${email}`
const verificationRecords: Map<string, VerificationRecord> = new Map(); // key: `${role}:${email}`

// SHA-256 helper for securely hashing passwords
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + ':moovvert_salt_2026').digest('hex');
}

// Generate random secure 6-digit numeric verification code
function generateSecure6DigitCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Nodemailer Transporter Helper
function getMailerTransporter() {
  const host = process.env.MAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.MAIL_PORT || '587', 10);
  const user = process.env.MAIL_USERNAME || '';
  const pass = (process.env.MAIL_PASSWORD || '').replace(/\s+/g, ''); // strip spaces from Google app password

  if (!user || !pass) {
    throw new Error(
      "Configuration Gmail SMTP manquante : veuillez renseigner MAIL_USERNAME et MAIL_PASSWORD (mot de passe d'application Google) dans votre fichier .env."
    );
  }

  if (host === 'smtp.gmail.com') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });
}

// Send real verification email via Gmail SMTP
async function sendVerificationEmail(toEmail: string, fullName: string, code: string) {
  const transporter = getMailerTransporter();
  const fromAddress = process.env.MAIL_FROM_ADDRESS || process.env.MAIL_USERNAME || 'noreply@moovvert.com';
  const fromName = process.env.MAIL_FROM_NAME || 'MoovVert';

  const mailOptions = {
    from: `"${fromName}" <${fromAddress}>`,
    to: toEmail,
    subject: 'MoovVert - Code de vérification',
    text: `Bonjour ${fullName},\n\nVotre code de vérification MoovVert est :\n\n${code}\n\nCe code expire dans 10 minutes.\n\nSi vous n'êtes pas à l'origine de cette inscription, ignorez cet email.`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 20px; background-color: #ffffff;">
        <div style="display: flex; align-items: center; margin-bottom: 20px;">
          <h2 style="color: #111827; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px;">
            Moov<span style="color: #00A86B;">Vert</span>
          </h2>
        </div>
        <p style="color: #334155; font-size: 15px; line-height: 1.5; margin-bottom: 8px;">
          Bonjour <strong>${fullName}</strong>,
        </p>
        <p style="color: #475569; font-size: 14px; line-height: 1.5; margin-bottom: 24px;">
          Voici votre code de vérification pour valider votre compte MoovVert :
        </p>
        <div style="background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border: 2px dashed #00A86B; border-radius: 16px; padding: 20px; text-align: center; margin-bottom: 24px;">
          <span style="font-family: monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #00A86B;">
            ${code}
          </span>
        </div>
        <p style="color: #64748b; font-size: 13px; line-height: 1.4; margin-bottom: 20px;">
          ⏳ <strong>Ce code expire dans 10 minutes.</strong> Il ne peut être utilisé qu'une seule fois.
        </p>
        <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 24px;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">
            Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité.
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

// -----------------------------------------------------------------------------
// API ROUTES
// -----------------------------------------------------------------------------

// POST /api/register
app.post('/api/register', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, role } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const userRole: 'client' | 'driver' = role === 'driver' ? 'driver' : 'client';

    if (!name || !cleanEmail || !password || !phone) {
      return res.status(400).json({ success: false, error: 'Veuillez remplir tous les champs obligatoires.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ success: false, error: 'Veuillez saisir une adresse email valide.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Le mot de passe doit comporter au moins 6 caractères.' });
    }

    const key = `${userRole}:${cleanEmail}`;
    if (users.has(key)) {
      return res.status(400).json({ success: false, error: 'Un compte avec cette adresse email existe déjà. Veuillez vous connecter.' });
    }

    // Generate 6-digit verification code
    const code = generateSecure6DigitCode();

    // Send real verification email via Gmail SMTP
    try {
      await sendVerificationEmail(cleanEmail, name.trim(), code);
    } catch (err: any) {
      console.error('SMTP Delivery Error:', err);
      return res.status(500).json({
        success: false,
        error: `Échec de l'envoi de l'email : ${err.message || 'Erreur SMTP'}`,
      });
    }

    // Save user with isEmailVerified = false
    const newUser: RegisteredUser = {
      id: `${userRole}_${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      passwordHash: hashPassword(password),
      role: userRole,
      isEmailVerified: false,
      email_verified_at: null,
      createdAt: new Date().toISOString(),
    };
    users.set(key, newUser);

    // Save verification record with 10-minute expiry
    verificationRecords.set(key, {
      email: cleanEmail,
      role: userRole,
      code,
      expiresAt: Date.now() + 10 * 60 * 1000,
      lastSentAt: Date.now(),
      attempts: 0,
    });

    return res.json({
      success: true,
      message: 'Compte créé avec succès. Un code de vérification a été envoyé à votre adresse email.',
      email: cleanEmail,
      role: userRole,
    });
  } catch (err: any) {
    console.error('Register route error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Erreur interne du serveur.' });
  }
});

// POST /api/verify-email
app.post('/api/verify-email', async (req: Request, res: Response) => {
  try {
    const { email, code, role } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanCode = (code || '').trim();
    const userRole: 'client' | 'driver' = role === 'driver' ? 'driver' : 'client';
    const key = `${userRole}:${cleanEmail}`;

    const record = verificationRecords.get(key);
    if (!record) {
      return res.status(400).json({
        success: false,
        error: 'Aucun code de vérification trouvé pour cette adresse email. Veuillez en demander un nouveau.',
      });
    }

    // Check expiration (10 min)
    if (Date.now() > record.expiresAt) {
      return res.status(400).json({
        success: false,
        expired: true,
        error: 'Ce code a expiré.',
      });
    }

    // Validate 6 digits
    if (record.code !== cleanCode) {
      record.attempts += 1;
      return res.status(400).json({
        success: false,
        error: 'Code incorrect. Veuillez réessayer.',
      });
    }

    // Code correct: mark email verified
    const user = users.get(key);
    const now = new Date().toISOString();
    if (user) {
      user.isEmailVerified = true;
      user.email_verified_at = now;
      users.set(key, user);
    }

    // Invalidate code so it cannot be used again
    verificationRecords.delete(key);

    return res.json({
      success: true,
      message: 'Votre adresse email a été vérifiée avec succès.',
      email_verified_at: now,
      user: user
        ? {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            isEmailVerified: true,
            email_verified_at: now,
          }
        : undefined,
    });
  } catch (err: any) {
    console.error('Verify email route error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Erreur interne.' });
  }
});

// POST /api/resend-verification-code
app.post('/api/resend-verification-code', async (req: Request, res: Response) => {
  try {
    const { email, role } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const userRole: 'client' | 'driver' = role === 'driver' ? 'driver' : 'client';
    const key = `${userRole}:${cleanEmail}`;

    const existing = verificationRecords.get(key);
    if (existing) {
      const elapsedSeconds = Math.floor((Date.now() - existing.lastSentAt) / 1000);
      if (elapsedSeconds < 60) {
        return res.status(429).json({
          success: false,
          error: `Veuillez patienter ${60 - elapsedSeconds} secondes avant de renvoyer un code.`,
          retryAfterSeconds: 60 - elapsedSeconds,
        });
      }
    }

    const user = users.get(key);
    const userName = user?.name || 'Utilisateur';

    // Generate new code and invalidate previous code
    const newCode = generateSecure6DigitCode();

    try {
      await sendVerificationEmail(cleanEmail, userName, newCode);
    } catch (err: any) {
      console.error('Resend SMTP Delivery Error:', err);
      return res.status(500).json({
        success: false,
        error: `Échec de l'envoi de l'email : ${err.message || 'Erreur SMTP'}`,
      });
    }

    // Reset 10-minute expiration timer
    verificationRecords.set(key, {
      email: cleanEmail,
      role: userRole,
      code: newCode,
      expiresAt: Date.now() + 10 * 60 * 1000,
      lastSentAt: Date.now(),
      attempts: 0,
    });

    return res.json({
      success: true,
      message: 'Un nouveau code de vérification a été envoyé à votre adresse email.',
    });
  } catch (err: any) {
    console.error('Resend route error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Erreur interne.' });
  }
});

// POST /api/login
app.post('/api/login', async (req: Request, res: Response) => {
  try {
    const { identifier, password, role } = req.body;
    const cleanEmail = (identifier || '').trim().toLowerCase();
    const userRole: 'client' | 'driver' = role === 'driver' ? 'driver' : 'client';

    if (!cleanEmail || !password) {
      return res.status(400).json({ success: false, error: 'Veuillez remplir tous les champs.' });
    }

    // Built-in Demo accounts check
    if (
      (cleanEmail === 'client@moovvert.com' && userRole === 'client' && password === 'Password123!') ||
      (cleanEmail === 'driver@moovvert.com' && userRole === 'driver' && password === 'Password123!')
    ) {
      return res.json({
        success: true,
        user: {
          id: userRole === 'client' ? 'client_001' : 'driver_001',
          name: userRole === 'client' ? 'Client Demo' : 'Chauffeur Demo',
          email: cleanEmail,
          phone: userRole === 'client' ? '06 45 28 91 03' : '06 82 14 77 90',
          role: userRole,
          isEmailVerified: true,
          email_verified_at: new Date().toISOString(),
        },
      });
    }

    const key = `${userRole}:${cleanEmail}`;
    const user = users.get(key);

    if (!user || user.passwordHash !== hashPassword(password)) {
      return res.status(401).json({
        success: false,
        error: 'Identifiants invalides. Veuillez vérifier votre adresse email et votre mot de passe.',
      });
    }

    // LOGIN PROTECTION: Account whose email is NOT verified must NOT be allowed to access
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        needs_verification: true,
        email: user.email,
        error: 'Veuillez vérifier votre adresse email avant de continuer.',
      });
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isEmailVerified: true,
        email_verified_at: user.email_verified_at,
      },
    });
  } catch (err: any) {
    console.error('Login route error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Erreur interne.' });
  }
});

// POST /api/forgot-password
app.post('/api/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail) {
      return res.status(400).json({ success: false, error: 'Email requis.' });
    }

    try {
      const transporter = getMailerTransporter();
      const fromAddress = process.env.MAIL_FROM_ADDRESS || process.env.MAIL_USERNAME || 'noreply@moovvert.com';
      const fromName = process.env.MAIL_FROM_NAME || 'MoovVert';

      await transporter.sendMail({
        from: `"${fromName}" <${fromAddress}>`,
        to: cleanEmail,
        subject: 'MoovVert - Réinitialisation de mot de passe',
        text: `Bonjour,\n\nVous avez demandé la réinitialisation de votre mot de passe MoovVert.\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez cet email.`,
      });
    } catch (err: any) {
      console.warn('Forgot password SMTP error (ignored for client privacy):', err.message);
    }

    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// -----------------------------------------------------------------------------
// VITE DEV MIDDLEWARE MOUNT
// -----------------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MoovVert server running on port ${PORT}`);
  });
}

startServer();
