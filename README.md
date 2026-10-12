# ubiquitous-disco
## Landing page

`index.html` is a self-contained static landing page (no build step). Open it in a browser or deploy to any static host (GitHub Pages, Netlify, Vercel).

The contact form posts to [FormSubmit](https://formsubmit.co), which forwards submissions by email. The first submission triggers a one-time activation email to the receiving inbox; after activating, FormSubmit offers a random alias you can put in `FORM_ENDPOINT` (bottom of `index.html`) so the address isn't visible in the page source.
