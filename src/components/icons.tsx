import type { ImgHTMLAttributes } from "react";

export const Logo = (props: ImgHTMLAttributes<HTMLImageElement>) => (
  <img
    src="https://firebasestorage.googleapis.com/v0/b/quizkong-mvp.firebasestorage.app/o/cloudpagestudio_logo_icon.svg?alt=media&token=2302b259-e195-45a2-9af0-0a64593dfde6"
    alt="Cloud Page Studio Logo"
    {...props}
  />
);
