# whoStared

A professional, backend-free web application to discover who starred and forked a GitHub repository.

**[View Live Demo](https://GarvitOfficial.github.io/whoStared/)** | **[GitHub Repository](https://github.com/GarvitOfficial/whoStared)**

## Features

- 🔍 **Analyze any public repository**: Just enter `username/repo` or the full URL.
- 🌟 **Stargazers List**: See who appreciates the code.
- 🔱 **Forks List**: See who is building upon the code.
- ⚡ **Fast & Responsive**: Built with Vite, React, and Tailwind CSS.
- 🎨 **Modern UI**: Beautiful dark-themed interface with smooth animations.
- 🚫 **No Login Required**: Uses the public GitHub API directly from your browser.

## Getting Started

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

## Tech Stack

- **Framework**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **HTTP Client**: Axios

## Limitations

- Due to using the unauthenticated GitHub API, requests are limited to 60 per hour per IP address.
- If you hit the limit, wait for an hour or switch networks.

## License

MIT
