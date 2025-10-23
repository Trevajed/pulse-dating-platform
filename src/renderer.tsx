import { jsxRenderer } from 'hono/jsx-renderer'

export const renderer = jsxRenderer(({ children }) => {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="PULSE - Digital Hanky Code Dating Platform for the LGBTQ+ leather community" />
        <title>PULSE - Digital Hanky Code Dating</title>
        <link href="/static/style.css" rel="stylesheet" />
        <script src="/static/app.js" defer></script>
      </head>
      <body>{children}</body>
    </html>
  )
})
