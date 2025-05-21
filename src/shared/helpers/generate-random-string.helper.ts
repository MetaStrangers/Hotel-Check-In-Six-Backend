import * as crypto from 'crypto';

interface GenerateRandomStringOptions {
  length?: number;
  includeUppercase?: boolean;
  includeLowercase?: boolean;
  includeNumbers?: boolean;
  includeSymbols?: boolean;
}

export const generateRandomString = ({
  length = 8,
  includeUppercase = true,
  includeLowercase = true,
  includeNumbers = true,
  includeSymbols = true,
}: GenerateRandomStringOptions = {}): string => {
  const uppercase: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase: string = 'abcdefghijklmnopqrstuvwxyz';
  const numbers: string = '0123456789';
  const symbols: string = '!@#$%^&*()_+~`|}{[]\\:;?><,./-=';

  // Validate character sets
  const sets: string[] = [];
  if (includeUppercase) sets.push(uppercase);
  if (includeLowercase) sets.push(lowercase);
  if (includeNumbers) sets.push(numbers);
  if (includeSymbols) sets.push(symbols);

  if (sets.length === 0) {
    throw new Error('At least one character set must be included');
  }

  if (length < sets.length) {
    throw new Error(`RandomString length must be at least ${sets.length}`);
  }

  // Generate ranStr components
  const allChars: string = sets.join('');
  const ranStr: string[] = [];

  // Ensure at least one character from each set
  sets.forEach((set: string) => ranStr.push(getRandomChar(set)));

  // Fill remaining length with random characters
  for (let i: number = sets.length; i < length; i++) {
    ranStr.push(getRandomChar(allChars));
  }

  // Shuffle to avoid predictable patterns
  shuffleArray(ranStr);

  return ranStr.join('');
};

function getRandomChar(str: string): string {
  return str[crypto.randomInt(0, str.length)];
}

function shuffleArray(array: string[]): void {
  for (let i: number = array.length - 1; i > 0; i--) {
    const j: number = crypto.randomInt(0, i + 1);
    [array[i], array[j]] = [array[j], array[i]];
  }
}
