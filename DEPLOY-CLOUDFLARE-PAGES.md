# EverestPoint Life OS - Cloudflare Pages Deploy

This project is a static site, so you do not need a build step for Cloudflare Pages.

## Files that must stay in the repo root

- `index.html`
- `dashboard.html`
- `styles.css`
- `script.js`
- `assets/`

## GitHub -> Cloudflare Pages setup

1. Create a new GitHub repository.
2. Upload this whole project folder to that repository.
3. Go to Cloudflare Dashboard.
4. Open `Workers & Pages`.
5. Click `Create application`.
6. Choose `Pages`.
7. Choose `Connect to Git`.
8. Select your GitHub repo.
9. Use these settings:

   - `Framework preset`: `None`
   - `Build command`: `exit 0`
   - `Build output directory`: `.`

10. Click `Save and Deploy`.

## Important notes

- `index.html` must stay at the top level or the root URL may not work.
- `localStorage` will still work after deployment because it runs in the browser.
- This version has no backend, so Cloudflare Pages is enough for testing.

## Shareable links

After deploy, Cloudflare will give you a URL like:

- `https://your-project-name.pages.dev`

Your dashboard page will be:

- `https://your-project-name.pages.dev/dashboard.html`

## When you update the site

If you are using GitHub:

1. change files locally
2. commit
3. push to GitHub
4. Cloudflare Pages redeploys automatically

## Later upgrade path

When you are ready for subscriptions, accounts, and premium gating, move to:

- frontend on Cloudflare Pages
- backend/auth/billing on a real app stack

For now, this setup is perfect for testing.
