# FocusRecipe

A collaborative recipe and meal planning Progressive Web App built with React, Tailwind CSS, and Supabase.

## Features

- **User Authentication**: Email/password and OAuth (Google, GitHub) sign-up/sign-in
- **Recipe Management**: Create, view, edit, and delete personal and family recipes
- **Family Groups**: Invite family members to share recipes and collaborate
- **Meal Planning**: Interactive calendar for planning family meals
- **Progressive Web App**: Works offline and can be installed on devices
- **Responsive Design**: Mobile-first design that works on all devices

## Tech Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Routing**: React Router
- **Icons**: Heroicons
- **Date Handling**: date-fns

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- A Supabase account (free tier is sufficient)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd recipeApp
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once your project is ready, go to Settings > API
3. Copy your Project URL and anon public key
4. Copy `.env.example` to `.env` and fill in your credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set Up Database Schema

1. In your Supabase project, go to the SQL Editor
2. Copy the entire contents of `database-schema.sql`
3. Paste and run the SQL to create all tables, policies, and triggers

### 4. Configure OAuth (Optional)

If you want Google/GitHub authentication:

1. In Supabase, go to Authentication > Providers
2. Enable Google and/or GitHub providers
3. Follow the setup instructions for each provider
4. Add the appropriate redirect URLs to your OAuth provider settings

### 5. Run the App

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Database Schema

The app uses the following main tables:

- `profiles` - User profile information
- `families` - Family groups for sharing
- `family_members` - Many-to-many relationship between users and families
- `recipes` - Recipe data (ingredients, instructions, etc.)
- `meal_plans` - Weekly/monthly meal plans
- `meal_plan_entries` - Individual meal assignments
- `invitations` - Family invitation system

See `database-schema.sql` for the complete schema including Row Level Security policies.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.jsx       # Main app layout with navigation
│   ├── FocusRecipeLogo.jsx
│   └── ProtectedRoute.jsx
├── contexts/           # React contexts
│   └── AuthContext.jsx  # Authentication state management
├── pages/             # Page components
│   ├── HomePage.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── DashboardPage.jsx
│   └── ...
├── services/          # API and external services
│   └── supabase.js    # Supabase client and helper functions
├── hooks/             # Custom React hooks
├── utils/             # Utility functions
└── App.jsx           # Main app component with routing
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Environment Variables

All environment variables must be prefixed with `VITE_` to be available in the Vite build:

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon public key

## Deployment

### Build for Production

```bash
npm run build
```

The build will be in the `dist` folder and is ready for deployment to any static hosting service.

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy automatically on push to main branch

### Deploy to Netlify

1. Run `npm run build`
2. Drag the `dist` folder to Netlify
3. Add environment variables in Netlify dashboard

## Security

- Row Level Security (RLS) is enabled on all tables
- Users can only access their own data and family data they're members of
- API keys are stored securely as environment variables
- Input validation and sanitization throughout the app

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

If you run into any issues:

1. Check the Supabase logs in your dashboard
2. Ensure your database schema is correctly set up
3. Verify your environment variables are correct
4. Check the browser console for any errors

## Future Features

- Recipe URL parsing/import from food blogs
- Smart shopping list generation
- Recipe scaling and nutrition information
- Advanced meal planning with dietary restrictions
- Recipe comments and ratings
- Mobile apps (React Native)
