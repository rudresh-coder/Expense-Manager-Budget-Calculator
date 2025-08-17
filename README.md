# Xpentia – Expense Manager & Budget Calculator

**Live Project:**  
[https://expense-manager-budget-calculator.vercel.app](https://expense-manager-budget-calculator.vercel.app)

---

## Overview

Xpentia is a modern, full-stack web app for tracking expenses, managing budgets, analyzing spending, and saving smarter.  
It supports offline mode, data sync, receipt scanning, analytics, premium features, and more.

---

## Tech Stack

- **Frontend:**  
  - React (TypeScript)
  - Vite
  - Mantine UI, MUI, Chart.js, React Chart.js 2
  - Tailwind CSS, custom CSS
  - React Router
  - Socket.io-client (real-time sync)
  - Tesseract.js (receipt OCR)
  - LocalForage (offline/local storage)
  - Framer Motion (animations)

- **Backend:**  
  - Node.js (TypeScript)
  - Express
  - MongoDB Atlas (cloud database)
  - Mongoose (ODM)
  - Socket.io (real-time sync)
  - Winston (logging)
  - Helmet (security)
  - Express-rate-limit, express-mongo-sanitize
  - Nodemailer (email sending)
  - JWT (authentication)
  - bcryptjs (password hashing)
  - node-cron (scheduled tasks)

- **Deployment:**  
  - Frontend: Vercel  
  - Backend: Railway

---

## Authentication

- JWT-based authentication for secure API access
- Email verification on signup
- Password reset via email

---

## Mailing

- SMTP via Gmail (Nodemailer)
- Automated emails for verification and password reset

---

## Features

- Expense tracking and analytics
- Budget calculator
- Receipt scanning (OCR)
- Offline mode and local sync
- Real-time updates via Socket.io
- Premium plans for advanced features
- Admin panel for user management
- Integrated Instamojo payment gateway for secure premium upgrades

---

## Visit the App

👉 [https://expense-manager-budget-calculator.vercel.app](https://expense-manager-budget-calculator.vercel.app)

---

## How to Use Expense Manager & Budget Calculator

- **Sign up** with your email and verify your account.
- **Add accounts** to track different banks or wallets.
- **Record transactions** (add, spend, transfer) and categorize with splits.
- **Scan receipts** using OCR for fast entry.
- **Use the Budget Calculator** to plan your monthly income and expenses.
- **Sync data** across devices and use offline mode when needed.
- **Upgrade to premium** for unlimited history and advanced analytics.
- **Export your data** as CSV anytime.
- **Manage users and data** in the admin panel (for admins).

---

## License

This project is licensed under the MIT License.  
See the [LICENSE](LICENSE) file for details.