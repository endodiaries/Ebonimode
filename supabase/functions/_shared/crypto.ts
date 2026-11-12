const enc = new TextEncoder();

export async function hmac(algo: "SHA-256" | "SHA-512", secret: string, data: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: algo }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
}

export const toHex = (b: Uint8Array) => Array.from(b).map((x) => x.toString(16).padStart(2, "0")).join("");
export const toBase64 = (b: Uint8Array) => btoa(String.fromCharCode(...b));

// Constant-time string comparison
export function safeEqual(a: string, b: string): boolean {
  const ea = enc.encode(a), eb = enc.encode(b);
  if (ea.length !== eb.length) return false;
  let diff = 0;
  for (let i = 0; i < ea.length; i++) diff |= ea[i] ^ eb[i];
  return diff === 0;
}
