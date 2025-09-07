
import type { ComponentProps } from "react";
import Image from "next/image";
import { useTheme } from 'next-themes';
import { useAuth } from "@/hooks/use-auth";

export const Logo = (props: Partial<ComponentProps<typeof Image>>) => {
  const { theme } = useAuth();
  
  const logoSrc = theme === 'dark' 
    ? "https://firebasestorage.googleapis.com/v0/b/quizkong-mvp.firebasestorage.app/o/morfeus_logo_dark.svg?alt=media&token=717e9359-5b3f-4d4f-b778-9bcf091d054b"
    : "https://firebasestorage.googleapis.com/v0/b/quizkong-mvp.firebasestorage.app/o/morfeus_logo_light.svg?alt=media&token=8d8eda65-809f-445f-9487-a8ceb3baaecd";

  if (props.src) { // If a specific src is provided (like the icon), use it
      return (
         <Image
            src={props.src as string}
            alt="Morfeus Icon"
            width={40}
            height={40}
            {...props}
        />
      )
  }

  return (
    <Image
      src={logoSrc}
      alt="Morfeus Logo"
      width={120}
      height={40}
      {...props}
    />
  );
};

export const LogoIcon = (props: Partial<ComponentProps<typeof Image>>) => (
    <Image
        src="https://firebasestorage.googleapis.com/v0/b/quizkong-mvp.firebasestorage.app/o/morfeus_logo_icon.svg?alt=media&token=3fcd759a-3975-4285-9c59-98b824674514"
        alt="Morfeus Icon"
        width={40}
        height={40}
        {...props}
    />
);
