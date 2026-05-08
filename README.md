# The Pune Platter Co. Website

A static storefront website for The Pune Platter Co.

## Run Locally

Open `index.html` in your browser.

## Files

- `index.html`: Main landing page
- `checkout.html`: Secondary checkout page
- `styles.css`: Shared styling
- `checkout.css`: Checkout page styling
- `script.js`: Main page WhatsApp interactions
- `checkout.js`: Checkout page interactions

## Deploy To GitHub Pages

This project is configured for GitHub Pages as a plain static site.

1. Push this folder to a GitHub repository.
2. Make sure your default branch is `main`.
3. In GitHub, open **Settings > Pages**.
4. Under **Build and deployment**, set **Source** to **GitHub Actions**.
5. Push to `main` and GitHub will deploy automatically using `.github/workflows/deploy-pages.yml`.

Notes:

- `.nojekyll` is included so GitHub Pages serves the site as-is.
- No build step is required.
- The site will be published at `https://<your-github-username>.github.io/<repo-name>/` unless you add a custom domain.

## Brand Palette Used

- Forest Green: `#46663f`
- Deep Green: `#2f4a30`
- Rustic Brown: `#5b2f1f`
- Warm Amber: `#bf8333`
- Cream Base: `#f7f1e5`
