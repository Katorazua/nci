import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nigerian Court Interpreter Support Tool",
  description: "AI-assisted English and Nigerian Pidgin translation for simple courtroom procedural communication.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
