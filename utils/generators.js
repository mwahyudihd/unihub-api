import CryptoJS from "crypto-js";

export function generateRandom6Digit() {
  const randomBytes = CryptoJS.lib.WordArray.random(4); // 4 bytes = 32 bit
  const hex = randomBytes.toString(CryptoJS.enc.Hex);
  const decimal = parseInt(hex, 16);
  const sixDigits = (decimal % 1000000).toString().padStart(6, '0');
  return sixDigits;
}