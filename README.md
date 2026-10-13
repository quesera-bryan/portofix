# Sera — Video Editor & Visual Storyteller

A static React + TypeScript portfolio built with Vite and ready for Vercel hosting.

## Project files

- `src/App.tsx` contains the page sections and interactions.
- `src/App.css` contains layout, responsive styles, and component styling.
- `src/data/projects.ts` contains portfolio entries and category data.
- `public/images/` and `public/Video/` contain the site's images and playable reel.
- `src/main.tsx` is the React entry point; `src/index.css` contains global styles.

## Run locally

```sh
npm install --cache ./.npm-cache
npm run dev
```

Create a production build with `npm run build`; preview it locally with `npm run preview`.

## Deploy to Vercel

This repository includes `vercel.json`. In Vercel, import the Git repository and keep the detected settings:

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`

Alternatively, from the project root:

```sh
npx vercel
```

Follow the prompts to create the free Hobby deployment. For a production deployment, run `npx vercel --prod`.

The production bundle is static and needs no server functions. `public/` contains files served by the website. The full-quality video master is kept in `source-media/`, outside the Vite public folder, so it stays in the project but is not copied into the deployed site. The site uses the web video at `public/Video/Portofolio SkautsarR-web.mp4`.

## Add a project

Add one object to the `projects` array in `src/data/projects.ts` for each video. Video files can stay on a video host: direct MP4/WebM links play in the native player, and YouTube or Vimeo watch/share links open in their embedded player. YouTube thumbnails are fetched automatically; direct video files show a frame from the video when no `thumbnail` is provided. For Vimeo, provide a `thumbnail` URL because Vimeo does not expose a public thumbnail image in its share link. For Instagram Reels and other social posts, use `externalUrl`; the project card opens a detail view with a link to the original post because social-page URLs are not direct video files.

```ts
{
	id: 'edit-01',
	title: 'Short edit 01',
	category: 'Short-form / Reels',
	description: 'A short description of the edit.',
	videoUrl: 'https://your-host.example/video.mp4',
	aspectRatio: '9 / 16',
}
```

Use `9 / 16` for Reels/Shorts and `16 / 9` for landscape videos. When `aspectRatio` is omitted, cards default to `9 / 16`. Optional `thumbnail`, `duration`, `year`, `views`, and `tools` values can be added when available. Add `views` only when you have a verified view count; cards with known counts sort highest-first, and unknown counts are not displayed. The gallery shows five cards initially and reveals more with its show-more button. Project filters are listed in `src/data/projects.ts`; empty categories show an empty state until a project is assigned to them.

## Supplied media

The portfolio uses `public/Video/Portofolio SkautsarR-web.mp4` as its playable showreel. The full-quality master is archived at `source-media/Portofolio SkautsarR-original.mp4`. Its poster is `public/images/portfolio-reel-poster.jpg`, and the hero portrait uses `public/images/Sera.png`. The supplied Instagram Reels use locally saved original thumbnails in `public/images/instagram-reels/`.

Current project categories include Educational video, Promotional video, and Hiburan. Instagram Reel links open on Instagram; they are not treated as direct playable video files.

Change `availabilityStatus` in `src/data/projects.ts` to set the availability label manually.
