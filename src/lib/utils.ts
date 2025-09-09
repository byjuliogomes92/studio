
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Gradient } from './types';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function copyToClipboard(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Modern API first
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
        .then(resolve)
        .catch(() => {
          // Fallback if modern API fails (e.g., in non-secure contexts)
          fallbackCopyToClipboard(text, resolve, reject);
        });
    } else {
      // Fallback for older browsers
      fallbackCopyToClipboard(text, resolve, reject);
    }
  });
}

function fallbackCopyToClipboard(text: string, resolve: () => void, reject: (reason?: any) => void) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  
  // Make the textarea invisible
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    if (successful) {
      resolve();
    } else {
      reject(new Error('Fallback: Falha ao copiar texto.'));
    }
  } catch (err) {
    reject(err);
  }

  document.body.removeChild(textArea);
}

export function generateGradientCss(gradient?: Gradient): string {
    if (!gradient || !gradient.colors || gradient.colors.length < 2) {
        return 'none';
    }

    const sortedColors = [...gradient.colors].sort((a, b) => a.position - b.position);
    const colorStops = sortedColors.map(c => `${c.color} ${c.position}%`).join(', ');

    if (gradient.type === 'radial') {
        return `radial-gradient(circle, ${colorStops})`;
    }

    // Default to linear
    const angle = gradient.angle !== undefined ? `${gradient.angle}deg` : '90deg';
    return `linear-gradient(${angle}, ${colorStops})`;
}
