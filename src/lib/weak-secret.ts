import "server-only";

const COMMON_PINS = new Set([
  "1004", "1010", "1122", "1212", "1313", "2000", "2001", "2580", "6969", "7777",
  "112233", "121212", "123123", "147258", "159753", "696969", "789456",
]);

const COMMON_PASSWORD_WORDS = [
  "password", "contraseña", "contrasena", "qwerty", "asdf", "123456", "abc123",
  "iloveyou", "teamo", "admin", "cuchumbo", "temu",
];

const MIN_DISTINCT_PASSWORD_CHARS = 6;

function isRepeated(value: string): boolean {
  return new Set(value).size === 1;
}

function isSequential(digits: string): boolean {
  const step = Number(digits[1]) - Number(digits[0]);
  if (Math.abs(step) !== 1) return false;
  return [...digits].every((digit, i) => i === 0 || Number(digit) - Number(digits[i - 1]) === step);
}

export function isWeakPin(pin: string): boolean {
  return COMMON_PINS.has(pin) || isRepeated(pin) || isSequential(pin);
}

export function isWeakPassword(password: string, name: string): boolean {
  const lower = password.toLowerCase();
  return (
    new Set(lower).size < MIN_DISTINCT_PASSWORD_CHARS ||
    COMMON_PASSWORD_WORDS.some((word) => lower.includes(word)) ||
    lower.includes(name.toLowerCase())
  );
}
