# AasaMedChem Inventory & Order Management System

A premium, high-precision inventory and order management system built with Next.js, Prisma, Neon PostgreSQL, TailwindCSS, and NextAuth.

## System Architecture

```mermaid
graph TD
  User([App User]) -->|Login Credentials| NextAuth[NextAuth Authentication]
  NextAuth -->|Role Discovery & Session| Router[Middleware Router]
  
  Router -->|Role: ADMIN| AdminDashboard[Admin Panel]
  Router -->|Role: SELLER| SellerDashboard[Seller Panel]
  Router -->|Role: BUYER| BuyerDashboard[Buyer Panel]

  SellerDashboard -->|Convert Units| ConversionEngine[Precision Conversion Engine]
  SellerDashboard -->|Add Items| CartService[Live Stock Validation Cart]
  CartService -->|Submit Checkout| QuotationService[Transaction System]
  
  AdminDashboard -->|Manage Products| ProductAPI[Product CRUD API]
  AdminDashboard -->|Process Quotations| AdminQuotationAPI[Quotation Approval API]

  AdminQuotationAPI -->|Prisma Transaction| DB[(Neon PostgreSQL DB)]
  ProductAPI -->|Prisma Client| DB
  QuotationService -->|Prisma Client| DB
  CartService -->|Stock Check| DB
```

## Role-Based Credentials

- **Admin Account**: `admin@gmail.com` / `admin123`
- **Seller Account**: `seller@gmail.com` / `seller123`
- **Buyer Account**: `buyer@gmail.com` / `buyer123`

## Features

- **Dynamic Role-Based Redirection**: Users are automatically authenticated and directed to their specific panel layout depending on their DB role.
- **Precision Conversion Engine**: Handles high-precision units scaling across Weight (g, kg), Volume (ml, l), and Count (units) using real-time density factor values.
- **Stock-Aware Cart Control**: Computes and restricts quantity submissions instantly against available database counts.
- **Atomic Transactional Checkout**: Deducts product volumes reliably upon Admin quotation approval using robust Prisma transactions.

## Installation & Setup

1. **Install Project Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Create a `.env` file in the root workspace folder:
   ```env
   DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
   NEXTAUTH_SECRET="AASAMEDCHEM"
   NEXTAUTH_URL="http://localhost:3000"
   ```

3. **Synchronize DB Schema**
   ```bash
   npx prisma db push
   ```

4. **Populate Database Records**
   ```bash
   npx prisma db seed
   ```

5. **Start Dev Server**
   ```bash
   npm run dev
   ```
