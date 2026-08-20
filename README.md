# SpaceReach 🚀
> **Enterprise AI-Powered CRM, Lead Acquisition Engine, HR Management & Finance Platform**

SpaceReach is an all-in-one revenue acceleration, customer relationship, human resource, and financial management suite built for modern scaling teams. Powered by **Laravel 11**, **React 19**, **Inertia.js v2**, and **Tailwind CSS v4**, SpaceReach combines real-time lead prospecting, pipeline tracking, workforce management, and automated customer engagement into a unified platform.

---

## 🌟 Key Features

### 🎯 1. Prospect & Lead Acquisition Engine
- **Master Lead Sheets**: Centralized database to view, filter, import, export, and manage leads in real-time.
- **Scraper & Tech Detector**: Automated extraction of company tech stacks, domain data, and qualification scoring.
- **Deduplication & Qualification Engine**: Prevents redundant lead imports and auto-scores leads based on customized ideal customer profiles (ICP).
- **Website Opportunity Analyzer**: Identifies website performance, design gaps, and optimization opportunities to personalize sales outreach.

### 💼 2. Opportunity & Deal Pipeline (CRM)
- **Visual Kanban & Pipeline**: Move deals seamlessly across custom sales stages.
- **Client & Contact Management**: Detailed contact profiles, activity timelines, interaction histories, and notes.
- **Proposals & Quotes Engine**: Create, send, and export quotes and commercial proposals directly to PDF.

### 👥 3. HR Management & Workforce Operations
- **Employee Directory & Groups**: Department organization, designations, and team structures.
- **Leave & Attendance Tracking**: Flexible leave requests, manager approval flows, and quota management.
- **OKRs & Key Results**: Goal setting, progress tracking, and key performance alignment.
- **Peer Reviews & Performance**: Multi-rater peer feedback and performance evaluation workflows.
- **Recognition & Rewards**: Peer-to-peer appreciation and reward points distribution.

### 💰 4. Finance & Revenue Intelligence
- **Invoice Management**: Generate branded PDF invoices with itemized pricing and automated tax calculations.
- **Payment Gateway & Tracking**: Record incoming payments, track outstanding balances, and monitor cash flow.
- **Financial Analytics & Reporting**: Real-time revenue reports, payment distributions, and forecasting dashboards.

### 🤖 5. Automated AI Chatbot Suite
- **Interactive Chatbot Widget**: Lightweight, customizable embeddable widget for instant customer engagement.
- **Knowledge Base & Synonyms**: Automated query matching, entity recognition, and synonym mapping.
- **Unanswered Query Logger**: Auto-captures unrecognized user questions for rapid knowledge base enrichment.

### 🔐 6. Enterprise Security & Administration
- **Role-Based Access Control (RBAC)**: Fine-grained permissions via `spatie/laravel-permission`.
- **Comprehensive Audit Logs**: Every critical action, edit, and deletion is recorded with IP and timestamp.
- **Two-Factor Authentication (2FA) & Passkeys**: Advanced user security powered by Laravel Fortify.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Backend Framework** | Laravel 11.x (PHP 8.2+) |
| **Frontend Framework** | React 19 + Inertia.js v2 |
| **Styling & UI** | Tailwind CSS v4 + Radix UI + Lucide Icons |
| **Build Tooling** | Vite 6 |
| **Database** | SQLite / MySQL / PostgreSQL |
| **PDF Generation** | `barryvdh/laravel-dompdf` |
| **Authentication & RBAC** | Laravel Fortify + Spatie Laravel Permission |
| **Continuous Integration** | GitHub Actions (`.github/workflows/ci.yml`) |

---

## 🚀 Quick Start & Installation

### Prerequisites
- PHP `>= 8.2`
- Composer `>= 2.x`
- Node.js `>= 20.x` & npm

### Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone git@github.com:thespacecode/SpaceReach.git SpaceReach
   cd SpaceReach
   ```

2. **Install PHP Dependencies**
   ```bash
   composer install
   ```

3. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

4. **Configure Environment**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. **Run Migrations & Seeders**
   ```bash
   php artisan migrate --seed
   ```

6. **Build Frontend & Start Development Servers**
   ```bash
   # Build assets for production
   npm run build

   # Start local development server
   php artisan serve
   # (In a second terminal window)
   npm run dev
   ```

---

## 🧪 Testing & CI Pipeline

SpaceReach includes automated quality checks and continuous integration powered by GitHub Actions.

- **Run PHP Unit & Feature Tests**:
  ```bash
  php artisan test
  ```

- **Run PHP Syntax Linting**:
  ```bash
  find app config database routes tests -name "*.php" -exec php -l {} \;
  ```

- **GitHub Actions Workflow**: Automatically runs syntax linting, PHPUnit tests, and production Vite asset builds on every push to `main`.

---

## 📜 License

SpaceReach is proprietary software built and maintained by **The Space Code**. All rights reserved.
