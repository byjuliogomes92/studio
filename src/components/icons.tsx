
import type { ComponentProps } from "react";
import Image from "next/image";

export const Logo = (props: Partial<ComponentProps<typeof Image>>) => (
  <Image
    src="https://firebasestorage.googleapis.com/v0/b/quizkong-mvp.firebasestorage.app/o/morfeu_logo_icon.svg?alt=media&token=d3b3612f-dc20-4900-aa30-b4376f496bb8"
    alt="Morfeus Logo"
    width={40}
    height={40}
    {...props}
  />
);
