# Welcome to CineWorld! The World of Cinema.
CineWorld is a modern movie and TV show discovery website built with TypeScript, Next.js 15, and Tailwind CSS, featuring TMDB API integration.

## Overview

Cineworld is a dynamic and immersive movie and TV show discovery platform that brings you information about an extensive collection of films and TV shows from various genres. Powered by React, Next.js 15, TypeScript, and Tailwind CSS, Cineworld offers an unparalleled user experience with modern UI components, responsive design, and smooth animations.

## Screenshots
![Screenshot 2023-07-13 230452](https://github.com/alanvarghesepaul22/CINEWORLD-NextJS/assets/86376232/965879a8-9604-4b77-a83c-026f594a2e21)

![Screenshot 2023-07-21 211717](https://github.com/alanvarghesepaul22/CINEWORLD-NextJS/assets/86376232/fae66266-2242-4311-9f53-8258c644b030)

## Responsive Design 

![Untitled-1](https://github.com/alanvarghesepaul22/CINEWORLD-NextJS/assets/86376232/a7bee4e3-59bd-4f64-8e47-d8d821f4425d)


## Key Features

- **🎬 Vast Content Library**: Explore movies and TV shows from trending, popular, top-rated, and latest categories
- **🎨 Modern UI/UX**: Beautiful hero section with animated slides, Shadcn/ui components, and smooth Framer Motion animations
- **📱 Fully Responsive**: Optimized for mobile, tablet, and desktop with 2-column mobile grid layout
- **⚡ Performance Optimized**: Next.js 15 with App Router, SWR caching, and TypeScript for fast loading
- **🎯 Advanced Search**: Enhanced search functionality with filters (coming in future updates)
- **❤️ Watchlist**: Save favorite movies and TV shows to local storage
- **🔔 Error Handling**: Graceful error handling with toast notifications
- **🎭 Category Sections**: Browse by Popular, Top Rated, Now Playing, and more with "See All" links
- **🔒 Production Ready**: Secure API key handling, environment variable configuration

## Installation and Setup

1. Clone the repository to your local machine:

```bash
git clone https://github.com/alanvarghesepaul22/CINEWORLD-NextJS.git
cd CINEWORLD-NextJS
```

2. Install the dependencies:

```bash
npm install
```

3. Set up environment variables:

   - Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

   - Get your free TMDB API key from [https://www.themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)

   - Update `.env.local` with your API key:
   ```plaintext
   API_KEY=your_actual_API_KEY_here
   ```

4. Run the development server:

```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:3000` to access Cineworld.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3.4
- **UI Components**: Shadcn/ui + Radix UI
- **Animations**: Framer Motion
- **State Management**: SWR (for API caching)
- **Icons**: Lucide React
- **API**: TMDB API
- **Notifications**: Sonner

## Production Deployment

### Environment Variables
For production deployment, set the following environment variable on your hosting platform:

```plaintext
API_KEY=your_actual_API_KEY_here
```

### Recommended Platforms

#### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add the `API_KEY` environment variable in Vercel's dashboard
3. Deploy automatically on every push to main branch

#### Netlify
1. Connect your repository
2. Set environment variables in build settings
3. Configure build command: `npm run build`

#### Railway / Render
1. Connect your repository
2. Set environment variables in service settings
3. Deploy with default Next.js settings

### Security Notes
- Never commit API keys to version control
- Use environment variables for all sensitive data
- The API key is only used server-side for security

## Contributing

We welcome contributions from the open-source community! If you find a bug, have a feature request, or want to contribute in any way, please feel free to submit a pull request.

## Acknowledgments

- Our gratitude to [TMDB](https://www.themoviedb.org/) for providing the incredible API that powers Cineworld.

- A big thank you to the developers of React, Next.js, and Tailwind CSS for creating these fantastic frameworks that made this project possible.

---

We hope you enjoy exploring Cineworld as much as we enjoyed creating it! Your feedback and support mean the world to us. Feel free to reach out with any questions or suggestions.

Happy movie streaming! 🍿🎥
