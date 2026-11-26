const signalPrefixes = [
  "Aqua",
  "Vanta",
  "Neon",
  "Lunar",
  "Rogue",
  "Static",
  "Electric",
  "Midnight",
  "Chrome",
  "Silent",
  "Hyper",
  "Zero",
];

const signalIdentities = [
  "Cipher",
  "Siren",
  "Pulse",
  "Orbit",
  "Tide",
  "Echo",
  "Nova",
  "Mirage",
  "Drift",
  "Specter",
  "Riptide",
  "Voltage",
];

export function normalizeClanName(value: string) {
  return value.trim().toLocaleLowerCase().replace(/[^a-z0-9]/g, "");
}

export function normalizeEmail(value: string) {
  return value.trim().toLocaleLowerCase();
}

export function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

export function createRandomClanName(variant = 0) {
  const entropy = new Uint32Array(3);
  crypto.getRandomValues(entropy);
  const prefix = signalPrefixes[(entropy[0] + variant) % signalPrefixes.length];
  const identity = signalIdentities[(entropy[1] + variant * 3) % signalIdentities.length];
  const number = ((entropy[2] + variant * 17) % 900) + 100;
  return `${prefix} ${identity} ${number}`;
}
