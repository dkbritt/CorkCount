# CorkCount Winery 🍷

A modern, full-stack wine e-commerce platform with advanced inventory management, automated tagging, and seamless order processing.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)

## 🌟 Features

### Customer Experience

- **Wine Catalog**: Browse and filter wines by type, price, and availability
- **Smart Search**: Find wines by name, type, or flavor characteristics
- **Shopping Cart**: Persistent cart with localStorage backup
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Order Tracking**: Real-time order status updates

### Admin Dashboard

- **Inventory Management**: Add, edit, and track wine inventory
- **Order Processing**: View and update order statuses
- **Batch Management**: Track wine batches and production runs
- **Analytics**: Sales metrics and inventory insights
- **Auto-Tagging**: AI-powered flavor tag generation

### Advanced Features

- **Automated Email System**: Order confirmations and status updates via Resend
- **Intelligent Wine Tagging**: Automatic flavor profile extraction
- **Real-time Updates**: Live inventory and order synchronization
- **Admin Authentication**: Secure admin panel access
- **Data Export**: Export capabilities for analytics

## 🛠️ Tech Stack

### Frontend

- **React 18** with TypeScript
- **Vite** for build tooling and development
- **React Router 6** for SPA routing
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **Framer Motion** for animations
- **React Query** for data fetching

### Backend

- **Express.js** server with TypeScript
- **Supabase** for database and real-time features
- **Resend** for transactional emails
- **Zod** for runtime type validation

### Development Tools

- **TypeScript** for type safety
- **Vitest** for testing
- **Prettier** for code formatting
- **PNPM** for package management

### Deployment

- **Netlify** for hosting and serverless functions
- **Supabase** for managed database
- **Environment-based configuration**

## 📁 Project Structure

```
├── client/                    # React frontend
│   ├── components/
│   │   ├── admin/            # Admin dashboard components
│   │   ├── ui/               # Reusable UI components
│   │   └── ...               # Feature components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utilities and services
│   ├── pages/                # Route components
│   └── App.tsx               # Main app component
├── server/                   # Express backend
│   ├── routes/               # API route handlers
│   └── index.ts              # Server configuration
├── shared/                   # Shared types and utilities
├── netlify/                  # Netlify functions
├── docs/                     # Documentation
├── sql_migrations/           # Database migrations
└── ...                       # Config files
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PNPM (recommended) or npm
- Supabase project
- Resend account (for emails)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd corkcount-winery
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email Configuration (Required)
RESEND_API_KEY=your_resend_api_key
VITE_FROM_EMAIL=orders@yourdomain.com

# Optional Email Configuration
VITE_FIL_EMAIL=admin@yourdomain.com
VITE_TEST_EMAIL=test@yourdomain.com

# Admin Authentication
VITE_ADMIN_USERNAME=admin
VITE_ADMIN_PASSWORD=your_secure_password
```

### 4. Database Setup

Run the SQL migrations in your Supabase SQL Editor:

```bash
# Apply the auto-tagging migration
cat sql_migrations/add_tags_to_inventory.sql
# Copy and run in Supabase SQL Editor
```

Create the required tables:

- `Inventory` - Wine inventory
- `Orders` - Customer orders
- `Batches` - Wine batch tracking

### 5. Start Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:8080`

## 📊 Database Schema

### Inventory Table

```sql
CREATE TABLE "Inventory" (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT,
  flavor_notes TEXT,
  description TEXT,
  price DECIMAL(10,2),
  quantity INTEGER DEFAULT 0,
  tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Orders Table

```sql
CREATE TABLE "Orders" (
  id SERIAL PRIMARY KEY,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  items JSONB NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🤖 Auto-Tagging System

The application features an intelligent wine tagging system that automatically generates flavor profiles:

### Supported Tag Categories

- **Berry**: strawberry, raspberry, blackberry, cherry
- **Citrus**: lemon, lime, orange, grapefruit
- **Earthy**: mineral, terroir, mushroom, soil
- **Floral**: rose, violet, lavender, jasmine
- **Chocolate**: chocolate, cocoa, mocha
- **Vanilla**: vanilla, caramel, butterscotch
- **Spicy**: pepper, cinnamon, clove, nutmeg
- **Herbal**: basil, thyme, mint, tobacco

### Usage

```typescript
import { autoTagWine } from "@/lib/autoTagger";

const tags = autoTagWine({
  flavorNotes: "Rich dark berries with earthy undertones",
  description: "Full-bodied red wine with chocolate notes",
  name: "Cabernet Sauvignon",
  type: "Red Wine",
});
// Returns: ["berry", "earthy", "chocolate"]
```

For detailed documentation, see [AUTO_TAGGING_GUIDE.md](docs/AUTO_TAGGING_GUIDE.md)

## 🔧 Development

### Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm test         # Run tests
pnpm typecheck    # Type checking
pnpm format.fix   # Format code
```

### API Endpoints

- `GET /api/ping` - Health check
- `POST /api/email` - Send transactional emails
- `GET /api/demo` - Demo endpoint

### Adding Features

#### New API Route

1. Create route handler in `server/routes/`
2. Register in `server/index.ts`
3. Add shared types in `shared/api.ts`

#### New Page

1. Create component in `client/pages/`
2. Add route in `client/App.tsx`

## 🚀 Deployment

### Netlify (Recommended)

The project is configured for Netlify deployment:

1. Connect your repository to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy automatically on push

### Manual Deployment

```bash
pnpm build
# Deploy dist/spa/ folder to static hosting
# Deploy netlify/functions/ as serverless functions
```

## 🎨 Styling

The application uses a comprehensive design system built with:

- **Tailwind CSS** for utility-first styling
- **Radix UI** for accessible components
- **Custom CSS variables** for theming
- **Responsive design** patterns

### Theme Customization

Modify colors and typography in:

- `tailwind.config.ts` - Tailwind configuration
- `client/global.css` - CSS variables and global styles

## 🧪 Testing

```bash
pnpm test        # Run all tests
pnpm test:watch  # Watch mode
```

Tests are written with Vitest and cover:

- Utility functions
- Component rendering
- API endpoints
- Auto-tagging logic

## 📈 Performance

### Optimization Features

- **Code splitting** with React Router
- **Lazy loading** for heavy components
- **Optimized images** and assets
- **Efficient state management**
- **Database indexing** for queries

### Monitoring

- Error tracking with structured logging
- Performance metrics
- Database query optimization
- Cache strategies

## 🔒 Security

### Implementation

- **Environment variables** for secrets
- **Input validation** with Zod
- **SQL injection prevention**
- **XSS protection**
- **Secure admin authentication**

### Best Practices

- Regular dependency updates
- Security headers
- Data sanitization
- Access control

## 🤝 Contributing

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Style

- Follow TypeScript best practices
- Use Prettier for formatting
- Write meaningful commit messages
- Add JSDoc for complex functions

### Pull Request Process

1. Ensure tests pass
2. Update documentation
3. Follow the PR template
4. Request review from maintainers

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation

- [Auto-Tagging Guide](docs/AUTO_TAGGING_GUIDE.md)
- [API Documentation](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

### Getting Help

- Check existing [GitHub Issues](../../issues)
- Create a new issue for bugs or feature requests
- Join our community discussions

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for the backend infrastructure
- [Radix UI](https://radix-ui.com) for accessible components
- [Tailwind CSS](https://tailwindcss.com) for the styling system
- [Resend](https://resend.com) for email delivery

---

**Built with ❤️ for wine enthusiasts and modern web development**
