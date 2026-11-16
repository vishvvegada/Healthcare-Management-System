# Healthcare Management System (Kanbuvar)

A comprehensive, multi-role hospital and healthcare management platform built with Next.js (App Router), React 19, Tailwind CSS, and Supabase.

---

## 🌟 Key Features

- **Multi-Role Dashboards**:
  - **Super Admin**: Manage multiple hospitals, assign administrators, and configure global roles.
  - **Hospital Admin**: Manage hospital staff, doctors, departments, and operations.
  - **Doctor**: View appointments, schedule slots, consult patients, and manage settings.
  - **Receptionist**: Patient check-ins, registration, and appointment bookings.
  - **Pharmacy Manager**: Track prescriptions, manage inventory, and handle orders.
  - **Lab Manager**: Manage test requests and upload lab diagnostic reports.
  - **Patient**: Book doctor appointments, view appointment history, and access prescriptions.
- **Secure Authentication & RBAC**: Integrated Supabase Auth with custom role-based access control and session management.
- **Modern UI**: Styled with Tailwind CSS v4, Lucide Icons, and responsive design for all devices.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router with Proxy)
- **Library**: React 19
- **Database & Auth**: Supabase (PostgreSQL, Auth, SSR)
- **Styling**: Tailwind CSS, Lucide React icons
- **Deployment**: Vercel

---

## 🚀 Getting Started Locally

### 1. Clone the repository
```bash
git clone https://github.com/vishvvegada/Healthcare-Management-System.git
cd Healthcare-Management-System
```

### 2. Install dependencies
```bash
npm install
```

### 3. Database Setup (Supabase)
1. Create a new project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** in your Supabase dashboard.
3. Open and run [`supabase_schema.sql`](./supabase_schema.sql) to create all required tables and roles.
4. (Optional) Run [`insert_super_admin.sql`](./insert_super_admin.sql) or use `/setup` in the browser to set up your initial Super Admin account.

### 4. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 5. Start the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Deploying to Vercel (Resolving 500 Internal Server Error)

### ⚠️ Why does Vercel show "Internal Server Error" (500)?
When running on your laptop, Next.js automatically loads `.env.local`. However, `.env.local` is **never committed to GitHub** (it is ignored in `.gitignore` for security reasons).

When you deploy your GitHub repository to Vercel, Vercel **does not have access to these environment variables** by default. When the app initializes Supabase or runs session checks in `proxy.ts`, the missing Supabase URL causes a runtime exception, returning a `500: INTERNAL_SERVER_ERROR`.

### 🔧 Step-by-Step Fix for Vercel Deployment:

1. **Go to Vercel Dashboard**:
   - Navigate to [vercel.com](https://vercel.com) and open your project.
2. **Open Project Settings**:
   - Click on the **Settings** tab at the top.
   - Click on **Environment Variables** in the left sidebar.
3. **Add the 3 Required Variables**:
   Add each of the following keys with values copied from your Supabase Dashboard (**Project Settings > API**):

   | Variable Name | Description | Scope |
   | ------------- | ----------- | ----- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL (`https://xyz.supabase.co`) | Production, Preview, Development |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Public Anon Key | Production, Preview, Development |
   | `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase Service Role Key (Keep Secret) | Production, Preview, Development |

4. **Redeploy the Application**:
   - Go to the **Deployments** tab in Vercel.
   - Find your latest deployment, click the **three dots (...)** on the right, and select **Redeploy**.
   - Ensure the "Use existing build cache" option is unchecked if you want a clean build.

After the redeployment finishes, your live project will load smoothly without any 500 errors!

---

## 🔒 Security Best Practices

- **Never commit `.env.local` or service keys** into public git repositories.
- Keep `SUPABASE_SERVICE_ROLE_KEY` strictly on the server-side (`app/setup`, `app/signup` server actions).
