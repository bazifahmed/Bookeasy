# BookEasy 📅

> ⚠️ **Status: Active Development — Not yet live. Currently in testing on Vercel (no custom domain attached).**

A white-label booking & scheduling SaaS for solo service professionals — built with React, Supabase, and Tailwind CSS.

---

## What Is BookEasy?

BookEasy gives solo service professionals (hair stylists, personal trainers, tutors, massage therapists, and more) their own branded online booking page — no coding needed on their end.

Each business owner gets:

- A public booking page at `/book/their-slug` with their logo and brand color
- A private dashboard to manage appointments, services, and availability
- Automatic email confirmations sent to both them and their clients
- A simple client history (CRM)

Built as a white-label template — one codebase, unlimited clients.

> 🚧 This project is currently in local + Vercel testing. No custom domain is attached yet. Production launch and commercialization are planned once testing is complete.

---

## Current Status

| Area | Status |
|------|--------|
| Project setup & structure | ✅ Done |
| Database schema (Supabase) | 🔄 In progress |
| Auth (login / signup) | 🔄 In progress |
| Public booking page | 🔄 In progress |
| Owner dashboard | 🔄 In progress |
| Email confirmations | 🔄 In progress |
| Landing page | 🔄 In progress |
| Vercel deployment | ✅ Deployed (test URL, no domain) |
| Custom domain | ⏳ Pending |
| First paying client | ⏳ Pending |

---

## Features (Planned / In Development)

- 🔐 **Auth** — Email/password login and signup via Supabase Auth
- 📆 **Smart Scheduling** — Clients pick a service, date, and available time slot in 3 steps
- ⚙️ **Availability Manager** — Owners set their weekly working hours day by day
- 💼 **Services Manager** — Add, edit, and toggle services with custom durations and prices
- 📋 **Bookings Dashboard** — View upcoming, today's, past, and cancelled appointments
- 🎨 **White-Label Branding** — Each client sets their own business name, logo, and brand color
- 📧 **Email Confirmations** — Auto-sent to client and owner on every booking via Resend
- 👥 **Client List** — Full history of everyone who has booked
- 🔗 **Unique Booking URLs** — Each business gets `/book/their-custom-slug`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| Database & Auth | Supabase (PostgreSQL) |
| Storage | Supabase Storage |
| Email | Resend |
| Hosting | Vercel (test deployment) |
| Icons | Lucide React |
| Routing | React Router v6 |
| Forms | React Hook Form + Zod |

---

## Project Structure

```
bookeasy/
├── public/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ColorPicker.jsx
│   │   └── ProtectedRoute.jsx
│   ├── context/
│   │   └── AuthContext.jsx  # Auth state & Supabase session
│   ├── lib/
│   │   ├── supabase.js      # Supabase client
│   │   └── email.js         # Resend email utility
│   ├── pages/
│   │   ├── HomePage.jsx         # Public landing page
│   │   ├── LoginPage.jsx
│   │   ├── SignupPage.jsx
│   │   ├── BookingPage.jsx      # Public 3-step booking flow
│   │   ├── BookingConfirmPage.jsx
│   │   ├── DashboardPage.jsx    # Dashboard layout + overview
│   │   ├── BookingsPage.jsx
│   │   ├── ServicesPage.jsx
│   │   ├── AvailabilityPage.jsx
│   │   ├── ClientsPage.jsx
│   │   └── SettingsPage.jsx
│   ├── App.jsx              # Routes
│   └── main.jsx             # App entry point
├── .env.example
├── .gitignore
├── index.html
├── tailwind.config.js
└── vite.config.js
```

---

## Database Schema

Five tables in Supabase PostgreSQL:

| Table | Purpose |
|-------|---------|
| `businesses` | Business owner profiles + branding |
| `services` | Services each business offers |
| `availability` | Weekly working hours per business |
| `bookings` | All appointment records |
| `blocked_times` | Dates/times the owner has blocked off |

Row Level Security (RLS) is enabled — owners can only access their own data. The public booking page reads availability and services without authentication.

---

## Running Locally

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [pnpm](https://pnpm.io/) — install with `npm install -g pnpm`
- A [Supabase](https://supabase.com) account (free)
- A [Resend](https://resend.com) account (free)

### 1. Clone the repo

```cmd
git clone https://github.com/YOUR_USERNAME/bookeasy.git
cd bookeasy
```

### 2. Install dependencies

```cmd
pnpm install
```

### 3. Set up environment variables

In the project root, create a file called `.env` and add:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_RESEND_API_KEY=your_resend_api_key
```

See `.env.example` for reference.

### 4. Set up the database

- Go to your [Supabase dashboard](https://supabase.com/dashboard)
- Open **SQL Editor** → New query
- Run the schema SQL from `supabase/schema.sql`
- Confirm all 5 tables appear in the **Table Editor**

### 5. Start the dev server

```cmd
pnpm run dev
```

Open `http://localhost:5173` in your browser.

---

## Test Deployment

The app is currently deployed on Vercel for testing purposes using the auto-generated Vercel URL (e.g. `bookeasy-xyz.vercel.app`). No custom domain is attached at this stage.

To run a fresh test build:

```cmd
pnpm run build
vercel --prod
```

---

## Environment Variables

| Variable | Where to get it |
|----------|----------------|
| `VITE_SUPABASE_URL` | Supabase dashboard → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase dashboard → Settings → API → anon public key |
| `VITE_RESEND_API_KEY` | resend.com → API Keys → Create Key |

---

## How White-Labeling Works

This is a **single deployed app** that serves multiple business owners — no rebuilding needed per client.

When a new client onboards:
1. They sign up at `/signup`
2. They fill in their business name, logo, brand color, and booking slug in `/dashboard/settings`
3. Their booking page goes live at `/book/their-slug`
4. They add their services and set their weekly hours
5. Their clients can start booking immediately

---

## Roadmap

**Phase 1 — Testing (current)**
- [x] Project scaffolding
- [ ] All core pages built
- [ ] End-to-end booking flow working
- [ ] Emails sending correctly
- [ ] Tested on mobile

**Phase 2 — Launch**
- [ ] Custom domain attached
- [ ] First client onboarded
- [ ] Payment collection set up

**Phase 3 — Growth**
- [ ] Stripe integration (collect payment at booking)
- [ ] SMS reminders
- [ ] Google Calendar sync
- [ ] Analytics dashboard
- [ ] Custom domain per client

---

## License

Private — All rights reserved. Not open source.

---

## Contact

Built by Bazif Ahmed — bazifworks@gmail.com
