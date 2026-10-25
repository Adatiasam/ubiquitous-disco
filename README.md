# Physeia Data Labs website

Static site, no build step. Deploys as is on GitHub Pages (or any static host).

| File | Purpose |
|---|---|
| `index.html` | Landing page |
| `privacy.html`, `terms.html` | Legal pages (have these reviewed before relying on them) |
| `404.html` | Branded not found page. Its links use the `/ubiquitous-disco/` prefix; change that if the site moves to a custom domain |
| `assets/site.css`, `assets/site.js` | Styles and behaviour |
| `assets/vendor/` | GSAP 3.12.5 (standard no charge license) and Lenis 1.1.13 (MIT), self hosted |
| `favicon.svg`, `og.png` | Browser icon and social sharing image |

## Contact form

The form posts to [FormSubmit](https://formsubmit.co), which forwards each brief by email. The endpoint is the `data-endpoint` attribute on `<form id="brief">` in `index.html`. After activating FormSubmit, replace the email address there with the random alias FormSubmit provides so the address is not visible in the page source.

## Credits

Icons: [Solar](https://www.figma.com/community/file/1166831539721848736) by 480 Design, CC BY 4.0, inlined from `@iconify-json/solar`. The EEG and ECG graphics are generated illustrative plots, not patient recordings.
