export type DigestAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';

export async function digestMessageStr(algo: DigestAlgorithm, message: string) {
  const msgUint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest(algo, msgUint8); // hash the message
  return toHex(hashBuffer);
}

export async function digestMessageBlob(algo: DigestAlgorithm, blob: Blob) {
  try {
    const buffer = await blob.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest(algo, buffer); // hash the message
    return toHex(hashBuffer);
  } catch (err) {
    return 'test-' + Math.floor(Math.random() * 1e12);
  }
}

export function toHex(buffer: ArrayBuffer) {
  const hashArray = Array.from(new Uint8Array(buffer)); // convert buffer to byte array
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join(''); // convert bytes to hex string
  return hashHex;
}
