export const STOREFRONT_URL = import.meta.env.VITE_STOREFRONT_URL || 'https://ladha.vercel.app/';

export function openStorefront(url = STOREFRONT_URL) {
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
