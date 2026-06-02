import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...input: Array<string | false | null | undefined>) => twMerge(clsx(input));
