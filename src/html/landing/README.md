# Nexora UI landing page

This NexoraUI product page uses the project's own logo, lime and indigo palette, Geist typeface, Remix icons, Bootstrap assets, and the existing dashboard pages. The live preview switches between pages already in `src/html`; the customization drawer calls the app's sidebar layout handler and updates its theme, direction, surfaces, and header position.

## Open it

Run the existing project command with `npm run dev`, then open:

`http://localhost:3000/html/landing/index.html`

The page and its landing-specific styles/scripts live together in this folder. The root project build copies nested HTML paths and their adjacent assets into `dist/html`, preserving the page's relative links.

## Before publishing

- Replace the purchase CTA with the product's marketplace URL when it is available.
- Review the page count and package details if the included project files change.
