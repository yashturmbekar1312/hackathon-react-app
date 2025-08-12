# Wealthify - Smart Salary & Investment Management

A comprehensive React TypeScript application for managing salary, tracking expenses, and receiving AI-powered investment suggestions.

## Features

### 🔐 Authentication & Onboarding
- JWT-based authentication
- OTP email verification (demo: use `123456`)
- User profile setup with risk preferences
- Savings threshold configuration

### 💰 Salary Management
- Income plan creation and management
- Multiple pay cycles (weekly, bi-weekly, monthly, quarterly)
- Salary verification and alerts
- Next payday tracking

### 📊 Expense Tracking
- Transaction import (CSV support)
- Auto-categorization with manual override
- Monthly budget creation and monitoring
- Budget utilization alerts
- Spending analysis by category

### 📈 Investment Suggestions
- AI-powered investment recommendations
- Risk-based suggestions (Conservative, Balanced, Aggressive)
- Surplus amount calculation
- Investment acceptance/rejection workflow
- Educational investment content

### 🔔 Smart Alerts
- Low savings alerts
- Missing salary notifications
- Budget breach warnings
- Automated financial monitoring

## Quick Start

### Demo Account
```
Email: demo@wealthify.com
Password: password
```

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── ui/                     # Reusable UI components
│   ├── auth/                   # Authentication components
│   ├── salary/                 # Salary management components
│   ├── expenses/               # Expense tracking components
│   ├── investment/             # Investment components
│   └── dashboard/              # Dashboard components
├── pages/
│   ├── Login.tsx              # Login page
│   ├── Signup.tsx             # Signup with OTP verification
│   ├── Dashboard.tsx          # Main dashboard
│   ├── SalaryManagement.tsx   # Salary management
│   ├── ExpenseTracking.tsx    # Expense tracking
│   └── InvestmentSuggestions.tsx # Investment suggestions
├── hooks/
│   ├── useAuth.ts             # Authentication hook
│   ├── useSalary.ts          # Salary management hook
│   ├── useExpenses.ts        # Expense tracking hook
│   └── useInvestments.ts     # Investment hook
├── services/
│   ├── api.ts                # API service layer
│   ├── auth.service.ts       # Authentication service
│   ├── salary.service.ts     # Salary service
│   ├── expense.service.ts    # Expense service
│   └── investment.service.ts # Investment service
├── types/
│   ├── auth.types.ts         # Authentication types
│   ├── salary.types.ts       # Salary types
│   ├── expense.types.ts      # Expense types
│   └── investment.types.ts   # Investment types
├── context/
│   └── AuthContext.tsx       # Authentication context
└── utils/
    ├── constants.ts          # App constants
    ├── helpers.ts           # Utility functions
    └── cn.ts               # Class name utility
```

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Routing**: React Router Dom
- **State Management**: React Context + Custom Hooks
- **Form Handling**: Formik + Yup validation
- **Build Tool**: Vite
- **API Layer**: Axios with interceptors

## Key Features Implementation

### Authentication Flow
1. Email/password signup with OTP verification
2. Profile setup (name, currency, risk profile, savings threshold)
3. JWT token storage and automatic authentication
4. Protected routes with loading states

### Financial Management
1. **Income Planning**: Set employer details, salary amount, pay cycle, and pay day
2. **Expense Tracking**: Import transactions, create budgets, monitor spending
3. **Investment Suggestions**: AI-generated recommendations based on surplus and risk profile

### Smart Algorithms
- **Auto-categorization**: Transactions classified by description patterns
- **Recurring Detection**: Identifies repeating transactions
- **Budget Monitoring**: Real-time alerts when approaching limits
- **Savings Projection**: Month-end savings calculation
- **Investment Matching**: Risk-based investment suggestions

## Mock Data & Development

The application includes comprehensive mock data and services for development:

- Mock authentication with demo credentials
- Simulated OTP verification
- Mock transaction data
- Fake investment suggestion generation
- Local storage persistence

## Production Considerations

For production deployment:

1. Replace mock services with real API endpoints
2. Implement proper backend authentication
3. Add real OTP/email service integration
4. Connect to actual bank APIs or financial data providers
5. Implement real investment platforms integration
6. Add proper error handling and logging
7. Set up monitoring and analytics

## Environment Variables

```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_JWT_SECRET=your-secret-key
```

## API Integration Points

The app is designed to integrate with:
- Authentication API (`/auth/*`)
- Salary management API (`/salary/*`)
- Transaction/expense API (`/transactions/*`, `/budgets/*`)
- Investment API (`/investments/*`)
- Bank integration APIs
- Email/SMS services for OTP

## Security Features

- JWT token authentication
- Secure local storage handling
- Protected route components
- Input validation and sanitization
- HTTPS-ready configuration

## Responsive Design

- Mobile-first approach
- Responsive grid layouts
- Touch-friendly interfaces
- Progressive enhancement

## Development Features

- TypeScript strict mode
- ESLint configuration
- Hot module replacement
- Build optimization
- Path aliases (@/* imports)

---

Built with ❤️ for the Hackathon - A complete financial management solution in React + TypeScript.
