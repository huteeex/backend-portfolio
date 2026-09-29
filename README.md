# Backend portfolio

Personal portfolio and résumé for Vladislav Kalashnikov, available in Russian and English. The main page leads with selected work and links to detailed case studies. Browser-only experiments live in a separate lab. The résumé is available online and as PDF and Word downloads.

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

- `src/components/HomePage.astro` and `src/components/SelectedWorkSection.astro` - home page and selected-work layout.
- `src/data/work.ts` - Russian and English case-study content for the diploma prototype, event-processing work, Windows utility and studio website. `src/components/WorkPage.astro` renders `/work/[slug]/` and `/en/work/[slug]/`.
- `src/components/LabPage.astro` and `src/data/content.ts` - three interactive browser concepts at `/lab/` and `/en/lab/`, with detail pages under `/projects/[slug]/`.
- `src/data/profile.ts` - contact links and profile data.
- `content/resume-draft.json` - shared résumé text for the website, PDF and Word.
- `scripts/generate_resume.py` - generates the four downloadable documents, a PNG preview for each PDF page and `public/downloads/resume-manifest.json` for the website preview.

The experiments run locally in the browser. Their proposed backend designs are described as concepts, separate from the selected work.

## Documents

`public/downloads/` contains Russian and English PDF and DOCX files. The generator accepts one- or two-page PDFs, renders every PDF page to a PNG preview and records the page count in a manifest. It uses `python-docx`, `reportlab`, `pypdf`, Poppler and Segoe UI font files by default on Windows. Font and Poppler paths can be supplied through command-line options (`--help`). PDF and DOCX share the same text model, but PDFs are generated separately rather than converted from Word.

The source materials and intermediate review files are not included in this repository. The published contact details are the ones supplied for this portfolio.

## Status

This repository contains the local review version. Pages carry `noindex` and `robots.txt` disallows crawling. Those settings should be revisited when the content and hosting domain are ready for publication.
