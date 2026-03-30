import type { Metadata } from "next"
import { Audiowide, Outfit, IBM_Plex_Mono } from "next/font/google"
import "./globals.css"

const audiowide = Audiowide({
  weight: "400",
  variable: "--font-audiowide",
  subsets: ["latin"],
  display: "swap",
})

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
})

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://bear.phaselabs.io"),
  title: "Bear Offset Visualizer | Phase",
  description:
    "See how staking rewards offset SOL price drawdowns. Powered by Phase.",
  openGraph: {
    title: "Bear Offset Visualizer | Phase",
    description:
      "See how staking rewards offset SOL price drawdowns. Powered by Phase.",
    siteName: "Phase",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${audiowide.variable} ${outfit.variable} ${ibmPlexMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
