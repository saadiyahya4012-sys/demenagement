// Pure standards-compliant RFC 6238 TOTP (Time-Based One-Time Password) implementation
// Compatible with Google Authenticator, Microsoft Authenticator, and Authy.
// Uses native Web Crypto API (SubtleCrypto HMAC-SHA1).

const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

// Generate a random Base32 secret (16 chars = 80 bits, standard for TOTP)
export function generateTotpSecret(length: number = 16): string {
  const randomBytes = new Uint8Array(length);
  crypto.getRandomValues(randomBytes);
  let secret = '';
  for (let i = 0; i < length; i++) {
    secret += BASE32_CHARS[randomBytes[i] % 32];
  }
  return secret;
}

// Base32 decoder to Uint8Array
function base32ToUint8Array(base32: string): Uint8Array {
  const clean = base32.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
  let bits = '';
  for (let i = 0; i < clean.length; i++) {
    const val = BASE32_CHARS.indexOf(clean[i]);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }

  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(bits.slice(i * 8, (i + 1) * 8), 2);
  }
  return bytes;
}

// Generate TOTP token for given secret and counter
async function generateTotpTokenForCounter(secret: string, counter: number): Promise<string> {
  const keyBytes = base32ToUint8Array(secret);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes.buffer as ArrayBuffer,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );

  const counterBuffer = new ArrayBuffer(8);
  const counterView = new DataView(counterBuffer);
  // Big-endian 64-bit integer
  counterView.setUint32(0, Math.floor(counter / 0x100000000));
  counterView.setUint32(4, counter & 0xffffffff);

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, counterBuffer);
  const hmacResult = new Uint8Array(signature);

  // Dynamic truncation (RFC 4226)
  const offset = hmacResult[hmacResult.length - 1] & 0x0f;
  const binary =
    ((hmacResult[offset] & 0x7f) << 24) |
    ((hmacResult[offset + 1] & 0xff) << 16) |
    ((hmacResult[offset + 2] & 0xff) << 8) |
    (hmacResult[offset + 3] & 0xff);

  const otp = (binary % 1000000).toString().padStart(6, '0');
  return otp;
}

// Generate current TOTP code (useful for testing or verification)
export async function generateTotpCode(secret: string): Promise<string> {
  const epoch = Math.floor(Date.now() / 1000);
  const counter = Math.floor(epoch / 30);
  return generateTotpTokenForCounter(secret, counter);
}

// Verify a 6-digit TOTP code against a secret with window allowance (-1, 0, +1 time steps = 90 sec window)
export async function verifyTotpCode(secret: string, token: string): Promise<boolean> {
  const cleanToken = token.trim();
  if (!cleanToken || cleanToken.length !== 6 || !/^\d{6}$/.test(cleanToken)) {
    return false;
  }

  const epoch = Math.floor(Date.now() / 1000);
  const currentCounter = Math.floor(epoch / 30);

  // Check window of -1, 0, +1 steps to allow slight clock drift
  for (let offset = -1; offset <= 1; offset++) {
    const generated = await generateTotpTokenForCounter(secret, currentCounter + offset);
    if (generated === cleanToken) {
      return true;
    }
  }

  return false;
}

// Build standard otpauth URI recognized by Google Authenticator and other apps
export function generateOtpAuthUri(issuer: string, accountName: string, secret: string): string {
  const cleanIssuer = encodeURIComponent(issuer.trim());
  const cleanAccount = encodeURIComponent(accountName.trim());
  return `otpauth://totp/${cleanIssuer}:${cleanAccount}?secret=${secret}&issuer=${cleanIssuer}&algorithm=SHA1&digits=6&period=30`;
}
