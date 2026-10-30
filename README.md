# Physeia Data Labs website

Static site, no build step. Deploys as is on GitHub Pages (or any static host). Live at https://physeiadatalab.com (set by the `CNAME` file).

| File | Purpose |
|---|---|
| `index.html` | Landing page |
| `privacy.html`, `terms.html` | Legal pages (have these reviewed before relying on them) |
| `404.html` | Branded not found page. Uses root relative links (`/`), so it works from any path on the domain |
| `assets/site.css`, `assets/site.js` | Styles and behaviour |
| `assets/vendor/` | GSAP 3.12.5 (standard no charge license) and Lenis 1.1.13 (MIT), self hosted |
| `favicon.svg`, `og.png` | Browser icon and social sharing image |

## Contact form

The form posts to [Web3Forms](https://web3forms.com), which emails each brief to contact@physeiadatalab.com (Zoho Mail). The access key is the hidden `access_key` input in `<form id="brief">` in `index.html`; it is safe to be public, as it can only send to that inbox. Manage it at web3forms.com. The public address shown on the site is hello@physeiadatalab.com. Without JavaScript the form posts directly and Web3Forms redirects back to `/?sent=1`, which shows the thank you message.

## Credits

Icons: [Solar](https://www.figma.com/community/file/1166831539721848736) by 480 Design, CC BY 4.0, inlined from `@iconify-json/solar`. The EEG and ECG graphics are generated illustrative plots, not patient recordings.
