import crypto from 'crypto';

// Base32 Alphabet (RFC 4648)
const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function generateBase32Secret(length = 20): string {
  const randomBytes = crypto.randomBytes(length);
  let result = '';
  for (let i = 0; i < randomBytes.length; i++) {
    result += BASE32_CHARS[randomBytes[i] % 32];
  }
  return result;
}

function base32ToBuffer(base32: string): Buffer {
  const cleaned = base32.toUpperCase().replace(/[^A-Z2-7]/g, '');
  const bits: number[] = [];
  for (let i = 0; i < cleaned.length; i++) {
    const val = BASE32_CHARS.indexOf(cleaned[i]);
    if (val === -1) continue;
    for (let b = 4; b >= 0; b--) {
      bits.push((val >> b) & 1);
    }
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    let byteVal = 0;
    for (let b = 0; b < 8; b++) {
      byteVal = (byteVal << 1) | bits[i + b];
    }
    bytes.push(byteVal);
  }
  return Buffer.from(bytes);
}

export function generateTOTP(secret: string, timeStep = 30, offset = 0): string {
  const key = base32ToBuffer(secret);
  const time = Math.floor(Date.now() / 1000 / timeStep) + offset;

  const buffer = Buffer.alloc(8);
  buffer.writeUInt32BE(0, 0);
  buffer.writeUInt32BE(time, 4);

  const hmac = crypto.createHmac('sha1', key).update(buffer).digest();
  const offsetByte = hmac[hmac.length - 1] & 0xf;
  const codeInt =
    ((hmac[offsetByte] & 0x7f) << 24) |
    ((hmac[offsetByte + 1] & 0xff) << 16) |
    ((hmac[offsetByte + 2] & 0xff) << 8) |
    (hmac[offsetByte + 3] & 0xff);

  const code = (codeInt % 1000000).toString().padStart(6, '0');
  return code;
}

export function verifyTOTP(token: string, secret: string, window = 1): boolean {
  const cleanedToken = token.trim();
  if (!/^\d{6}$/.test(cleanedToken)) return false;

  for (let i = -window; i <= window; i++) {
    const generated = generateTOTP(secret, 30, i);
    if (generated === cleanedToken) {
      return true;
    }
  }
  return false;
}

export function generateRecoveryCodes(count = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const hex = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(`${hex.substring(0, 4)}-${hex.substring(4, 8)}`);
  }
  return codes;
}

export function generateOtpAuthUri(label: string, issuer: string, secret: string): string {
  const encodedLabel = encodeURIComponent(label);
  const encodedIssuer = encodeURIComponent(issuer);
  return `otpauth://totp/${encodedIssuer}:${encodedLabel}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}
