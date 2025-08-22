# Subscription Cancellation Flow

A Next.js application implementing a sophisticated subscription cancellation flow with A/B testing, downsell offers, and comprehensive data collection.

## Features

- **Multi-step cancellation wizard** with conditional logic
- **A/B testing** with server-side variant assignment
- **Downsell offers** (50% off) for variant B users
- **Comprehensive data collection** including job search metrics and visa requirements
- **Row Level Security (RLS)** with proper policy management
- **Real-time data persistence** throughout the cancellation flow

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase (PostgreSQL)
- **Database**: PostgreSQL with RLS policies
- **Validation**: Zod for schema validation

## Prerequisites

- Node.js 18+
- Supabase CLI
- Git

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd subscription-cancellation-flow
npm install
```

### 2. Database Setup

Start your local Supabase instance:

```bash
supabase start
```

Run the database migration:

```bash
supabase db reset
```

Or manually execute the SQL schema in your Supabase dashboard using the provided `seed.sql` file.

### 3. Environment Configuration

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_ORIGIN=http://localhost:3000
```

Get your service role key from:

```bash
supabase status
```

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Database Schema

The application uses three main tables:

- **users**: Basic user information
- **subscriptions**: Subscription data with pricing and status
- **cancellations**: Cancellation flow data with A/B variant tracking

## Testing with Different Users

### Default Test Users

The application comes with pre-seeded test data

### Testing Different Scenarios

1. **Change the mock user** in your component:

```typescript
// In your main component file
const mockUser = {
  email: "user2@example.com", // Change this
  id: "550e8400-e29b-41d4-a716-446655440002", // And this
};
```

2. **Create new test users** via SQL:

```sql
-- Add new test user
INSERT INTO users (id, email) VALUES
('your-new-uuid', 'newuser@example.com');

-- Add subscription for new user
INSERT INTO subscriptions (id, user_id, monthly_price, status) VALUES
('your-subscription-uuid', 'your-new-uuid', 2500, 'active');
```

3. **Test A/B variants** by clearing cancellation data:

```sql
-- Reset cancellation data to get new variant assignment
DELETE FROM cancellations WHERE user_id = 'your-user-id';
```

### A/B Testing Behavior

- **Variant A**: No downsell offers shown
- **Variant B**: 50% off downsell offers displayed
- Variant assignment is deterministic and sticky per user

### Testing Different Flow Paths

1. **Yes Flow** (User got a job):

   - Answer "Yes" to initial question
   - Complete job search metrics
   - Fill visa requirements
   - Reach cancellation success

2. **No Flow** (User didn't get a job):

   - Answer "No" to initial question
   - See downsell offer (Variant B only)
   - Either accept offer or continue to cancellation

3. **Downsell Acceptance**:
   - Decline initial offer
   - Get second chance in usage questions
   - Accept offer to see success screen

## API Endpoints

- `POST /api/cancellations/start` - Initialize cancellation flow
- `POST /api/cancellations/complete` - Save final cancellation data

## Key Components

- `SubscriptionCancellationFlowContent` - Main flow orchestrator
- `SubscriptionCancellationIntro` - Initial yes/no question
- `ReasonYesScreen` - Job search metrics collection
- `ReasonNoScreen` - Downsell offer presentation
- `EnterDetailsScreen` - Feedback collection
- `EnterVisaRequirementScreen` - Visa assistance questions
- `CancellationSuccessScreen` - Flow completion
- `DownsellSuccess` - Discount acceptance confirmation

## Data Flow

1. **Start API** creates cancellation record with A/B variant
2. **User progresses** through conditional flow steps
3. **Data auto-saves** when reaching cancellation success
4. **Complete API** updates record with all collected information

## Troubleshooting

### Common Issues

1. **"No cancellation ID"**: Ensure start API completes successfully
2. **Database connection errors**: Check Supabase is running and environment variables are correct
3. **RLS policy errors**: Verify you're using the service role key, not anon key
4. **Variant not showing offers**: Check that user is assigned variant B

### Reset Test Data

```sql
-- Clear all cancellation data
DELETE FROM cancellations;

-- Reset subscription statuses
UPDATE subscriptions SET
  status = 'active',
  cancel_requested_at = NULL,
  cancelled_at = NULL;
```

## Development Notes

- Component state is preserved during the flow to prevent data loss
- Auto-save occurs when users reach the success screen
- Downsell eligibility can be enhanced with usage tracking
- All monetary values are stored in cents in the database

## Production Considerations

- Add proper user authentication
- Implement rate limiting on APIs
- Add monitoring and analytics
- Configure proper CORS policies
- Set up database backups
- Add email notifications for cancellations
