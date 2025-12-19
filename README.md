# Kam Yoga Website

A website for Kam Yoga, offering yoga classes, meditation sessions, and workshops in Ireland.

## Project Overview

This website provides information about Kam Yoga's offerings, including:
- Yoga classes (Dru Yoga)
- Meditation sessions
- Workshops
- Children's yoga
- Blog with yoga and wellness content

## Technologies

This project is built with:
- **Vite** - Build tool and development server
- **TypeScript** - Type-safe JavaScript
- **React** - UI library
- **React Router** - Client-side routing
- **shadcn-ui** - UI component library
- **Tailwind CSS** - Utility-first CSS framework

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
```sh
git clone <YOUR_GIT_URL>
cd kam-yoga
```

2. Install dependencies:
```sh
npm install
```

3. Start the development server:
```sh
npm run dev
```

The application will be available at `http://localhost:8080`

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/     # React components
│   ├── blog/      # Blog-related components
│   ├── classes/   # Class booking components
│   ├── home/      # Home page sections
│   ├── layout/    # Header, Footer
│   └── ui/        # shadcn-ui components
├── data/          # Static data (blog posts, classes)
├── hooks/         # Custom React hooks
├── lib/           # Utility functions
├── pages/         # Page components
└── main.tsx       # Application entry point
```

## Deployment

### GitHub Pages

This project is configured for GitHub Pages deployment at `/kam-yoga/`.

1. Build the project:
```sh
npm run build
```

2. Deploy the `dist` folder to GitHub Pages:
   - Go to your repository Settings > Pages
   - Set Source to "GitHub Actions" or "Deploy from a branch"
   - If using branch deployment, select the branch (e.g., `main` or `gh-pages`) and set the folder to `/dist`
   - Or use GitHub Actions to automatically deploy on push

3. The site will be available at `https://<username>.github.io/kam-yoga/`

**Note:** The app is configured with base path `/kam-yoga/`. If you change the repository name or deploy to a custom domain, update the `base` in `vite.config.ts` and `basename` in `src/App.tsx`.

### Other Static Hosting

Build the project for production:

```sh
npm run build
```

The `dist` folder will contain the production-ready files that can be deployed to any static hosting service (Vercel, Netlify, etc.).

**For root domain deployment:** Update `vite.config.ts` to set `base: "/"` and remove the `basename` prop from `BrowserRouter` in `src/App.tsx`.

## License

© 2024 Kam Yoga. All rights reserved.
