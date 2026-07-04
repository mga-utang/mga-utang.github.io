# Sari-Sari Store Community Credit Ledger

A mobile-first Progressive Web App (PWA) for managing customer credit records across a community of sari-sari stores.

## Features
- User authentication with email/password (Supabase Auth)
- Global search for customers by name or Purok
- Community credit risk summary with color coding
- Individual store credit management
- Multi-store visibility of customer credit balances

## Tech Stack
- Frontend: React (Vite), TypeScript, Tailwind CSS, Lucide React
- Backend & Database: Supabase (PostgreSQL with RLS)

## Getting Started

### Prerequisites
- Node.js
- A Supabase project

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
4. Run the SQL script in `sql/001_init.sql` in your Supabase SQL Editor
5. Start the development server: `npm run dev`

## Usage
1. Sign up or log in as a store owner
2. Add customers using the Quick Add Customer button
3. View a customer's profile to see their community credit summary
4. Update or open a credit ledger for the customer at your store

## Database Schema
The database uses three main tables:
1. `profiles`: Store owner profiles linked to auth.users
2. `customers`: Customer information
3. `ledgers`: Credit records with unique constraints per customer-store pair

## Security
Row-Level Security (RLS) policies ensure:
- All authenticated users can read profiles, customers, and ledgers
- Store owners can only modify their own ledgers
