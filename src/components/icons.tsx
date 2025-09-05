import type { ImgHTMLAttributes } from "react";
import Image from "next/image";

export const Logo = (props: ImgHTMLAttributes<HTMLImageElement>) => (
  <Image
    src="https://firebasestorage.googleapis.com/v0/b/quizkong-mvp.firebasestorage.app/o/morfeu_logo.svg?alt=media&token=02a2a856-ec22-4be3-8446-2fed5b6bad81"
    alt="Morfeu Logo"
    width={40}
    height={40}
    {...props}
  />
);
