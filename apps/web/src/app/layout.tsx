import type { Metadata } from 'next'
import '../styles/globals.css'
import '../styles/netflix-theme.css'

export const metadata: Metadata = {
  title: 'Shashwat Raj | AI Engineer',
  description: 'AI Engineer | IIT Delhi | Building Scalable AI Systems',
  icons: {
    icon: '/assets/icons/icon.png',
    shortcut: '/assets/icons/icon.png',
    apple: '/assets/icons/icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
        />
      </head>
      <body>
        <div className="aura-glow"></div>
        {children}
      </body>
    </html>
  )
}
