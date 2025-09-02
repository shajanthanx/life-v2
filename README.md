# Life Management Dashboard v2

A comprehensive personal life management dashboard built with Next.js, TypeScript, Tailwind CSS, and Supabase. This application helps you track goals, tasks, habits, health metrics, finances, and more in one unified platform.

## 🚀 Features

### Authentication & User Management
- **Supabase Authentication**: Secure email/password authentication
- **User Profiles**: Customizable user profiles with avatar support
- **Session Management**: Persistent login sessions with automatic refresh

### Productivity Module
- **Goals Management**: SMART goals with milestones and progress tracking
- **Task Management**: Create, categorize, and track tasks with priorities
- **Habit Tracking**: Build positive habits with streak tracking and analytics

### Health & Wellness
- **Sleep Tracking**: Monitor sleep duration and quality
- **Exercise Records**: Log workouts with photos and metrics
- **Nutrition Tracking**: Track meals and caloric intake

### Finance Management
- **Transaction Tracking**: Record income and expenses
- **Budget Management**: Set and monitor budget categories
- **Savings Goals**: Track progress toward financial objectives
- **Investment Tracking**: Monitor investment performance

### Lifestyle Features
- **Journal**: Daily journaling with mood tracking and photos
- **Reading List**: Track books with progress and ratings
- **Movie Watchlist**: Manage movies to watch and watched
- **Memory Keeper**: Store special memories with photos and tags
- **Visualization Board**: Goal visualization with progress tracking

### Advanced Features
- **Freelancing Tools**: Project management and time tracking
- **Secrets Manager**: Secure password and sensitive data storage
- **Gift Planning**: Plan and track gifts for special occasions
- **Global Search**: Search across all your data
- **Data Export/Import**: Backup and restore your data

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: Tailwind CSS, Radix UI, Lucide Icons
- **Backend**: Supabase (PostgreSQL database, Authentication, Storage)
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd life-v2
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

Follow the detailed setup guide in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) to:
- Create a Supabase project
- Set up the database schema
- Configure storage buckets
- Set up authentication

### 4. Configure Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 5. Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

## 📁 Project Structure

```
src/
├── app/                 # Next.js app router
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard overview
│   ├── productivity/   # Goals, tasks, habits
│   ├── health/         # Health tracking
│   ├── finance/        # Financial management
│   ├── lifestyle/      # Journal, books, movies
│   ├── modals/         # Modal dialogs
│   └── ui/             # Reusable UI components
├── lib/                 # Utility functions and services
│   ├── api/            # API layer for data operations
│   ├── auth.ts         # Authentication service
│   ├── database.ts     # Database service
│   ├── supabase.ts     # Supabase client configuration
│   └── storage-service.ts # File storage utilities
└── types/              # TypeScript type definitions
```

## 🔧 Key Features Implementation

### Data Management
- **Real-time sync**: All data is automatically synchronized with Supabase
- **Offline-first**: Components handle loading states gracefully
- **Type safety**: Full TypeScript coverage for data models

### Security
- **Row Level Security**: Users can only access their own data
- **Secure file uploads**: Images are stored in private buckets
- **Authentication**: Built on Supabase's proven auth system

### Performance
- **Image optimization**: Automatic image compression before upload
- **Efficient queries**: Optimized database queries with proper indexing
- **Progressive loading**: Components load incrementally

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Make sure to set these in your deployment platform:

```
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
```

## 📊 Database Schema

The application uses a comprehensive PostgreSQL schema with:
- **User profiles and authentication**
- **Productivity data** (goals, tasks, habits)
- **Health records** (sleep, exercise, nutrition)
- **Financial data** (transactions, budgets, investments)
- **Lifestyle content** (journal, books, movies, memories)
- **Advanced features** (freelancing, secrets, events)

See `supabase-schema.sql` for the complete database structure.

## 🔐 Privacy & Security

- **Data Privacy**: All user data is private and isolated using Row Level Security
- **Secure Storage**: Files are stored in private buckets with proper access controls
- **Authentication**: Industry-standard authentication with Supabase
- **No Third-party Tracking**: Your personal data stays private

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 Migration from v1

If you're upgrading from the localStorage-based version:

1. **Export your data** using the export function in the old version
2. **Set up Supabase** following the setup guide
3. **Manually recreate important data** in the new version
4. **Note**: Images will need to be re-uploaded as they were stored as base64

## 🔧 Troubleshooting

### Common Issues

1. **Authentication errors**: Check environment variables
2. **Database connection issues**: Verify Supabase configuration
3. **Image upload failures**: Check storage bucket setup
4. **Build errors**: Ensure all dependencies are installed

### Getting Help

- Check the [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) guide
- Review Supabase documentation
- Open an issue for bugs or feature requests

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Supabase](https://supabase.com/)
- UI components from [Radix UI](https://radix-ui.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Lucide](https://lucide.dev/)

---

**Note**: This is a personal life management tool. All data is stored securely and privately in your own Supabase instance.