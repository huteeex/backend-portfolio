# Backend portfolio

Personal portfolio and résumé for Vladislav Kalashnikov. The site is available in Russian and English. It presents backend experience by task, includes three interactive browser demos, and offers PDF and Word versions of the résumé.

## Stack

Astro, TypeScript and CSS render the static pages. React and Motion power the interactive demos. The site itself does not require a database or server API.

## Run locally

Requires Node.js 22.12 or newer.

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:4321/`. For a production build:

```sh
npm run check
npm run build
npm run preview
```

The development and preview servers use the same port. Stop one before starting the other. Preview serves `dist`, so rebuild after changing source files.

## Content

- `src/components/HomePage.astro` - home page copy and layout.
- `src/data/experience.ts` - experience summaries in Russian and English.
- `src/data/content.ts` - three experiment descriptions and system plans.
- `src/data/work.ts` - detailed pages for existing code projects, accessible by direct URL.
- `src/data/profile.ts` - contact links and profile data.
- `content/resume-draft.json` - shared résumé text for the website, PDF and Word.
- `scripts/generate_resume.py` - generates the four downloadable documents and PDF previews.

The experiments run locally in the browser. Their proposed backend designs are described as concepts, not as deployed services.

## Documents

`public/downloads/` contains Russian and English PDF and DOCX files. The generator uses `python-docx`, `reportlab`, `pypdf`, Poppler and Arial font files. It accepts explicit font and Poppler paths through command-line options (`--help`). PDF and DOCX share the same content model, but the PDFs are generated separately rather than converted from Word.

The source materials and intermediate review files are not included in this repository. The published contact details are the ones supplied for this portfolio.

## Status

This repository contains the local review version. Pages carry `noindex` and `robots.txt` disallows crawling. Those settings should be revisited when the content and hosting domain are ready for publication.