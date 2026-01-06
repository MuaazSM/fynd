# Fynd AI Frontend

A production-ready React frontend for the Fynd AI Feedback System.

## Features

- **Public Submission Page**: Users can submit ratings (1-5 stars) and reviews
- **Submission Status Page**: Real-time polling to track submission processing status
- **Admin Login**: Secure JWT-based authentication
- **Admin Dashboard**: Comprehensive dashboard with:
  - Real-time submissions table with filters and search
  - Analytics cards showing key metrics
  - Interactive charts (rating distribution, submissions over time)
  - Pagination for large datasets
  - Expandable rows and detailed modal views

## Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- React Router (routing)
- Tailwind CSS (styling)
- shadcn/ui (UI components)
- Recharts (analytics)
- Lucide React (icons)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_POLL_INTERVAL_MS=2000
```

3. Run development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

5. Preview production build:
```bash
npm run preview
```

## Environment Variables

- `VITE_API_BASE_URL`: Backend API URL (default: http://localhost:8000)
- `VITE_POLL_INTERVAL_MS`: Polling interval for submission status (default: 2000ms)

## Deployment

### Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Render

1. Create new Static Site
2. Connect GitHub repository
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Set environment variables
6. Deploy

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── Layout.tsx       # Main layout wrapper
│   ├── RatingStars.tsx  # Star rating component
│   ├── StatusBadge.tsx  # Status indicator
│   ├── ErrorBanner.tsx  # Error display
│   ├── Pagination.tsx   # Table pagination
│   ├── AnalyticsCards.tsx  # Metric cards
│   └── AnalyticsChart.tsx  # Chart visualizations
├── pages/
│   ├── PublicSubmit.tsx      # Public submission form
│   ├── SubmissionStatus.tsx  # Status tracking page
│   ├── AdminLogin.tsx        # Admin authentication
│   └── AdminDashboard.tsx    # Admin management panel
├── lib/
│   ├── api.ts     # API client functions
│   ├── auth.ts    # Authentication utilities
│   └── utils.ts   # Helper functions
├── App.tsx        # Route configuration
├── main.tsx       # Application entry point
└── styles.css     # Global styles
```

## API Integration

The frontend expects the following backend endpoints:

### Public APIs
- `POST /api/submissions` - Create submission
- `GET /api/submissions/{id}` - Get submission status

### Admin APIs (JWT protected)
- `POST /api/admin/login` - Authenticate admin
- `GET /api/admin/submissions` - List submissions (with filters)
- `GET /api/admin/analytics` - Get analytics data

## Features Implemented

### Public Interface
- Star rating selection with visual feedback
- Review text input with character count
- Real-time submission status polling
- Loading states and error handling
- Responsive design

### Admin Interface
- Secure authentication with JWT
- Comprehensive submissions table
- Advanced filtering (rating, status, search)
- Pagination for large datasets
- Expandable rows for quick preview
- Detailed modal for full submission view
- Real-time analytics dashboard
- Interactive charts and visualizations
- Auto-refresh capability

## Design Philosophy

The UI features a distinctive dark theme with:
- Serif headings (Instrument Serif) for elegance
- Sans-serif body text (DM Sans) for readability
- Golden accent color (#FCD34D) for highlights
- Glassmorphism effects for depth
- Subtle animations for polish
- Grain texture overlay for character

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
