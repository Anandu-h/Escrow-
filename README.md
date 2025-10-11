# Escrow DApp

A decentralized escrow application built with Next.js and blockchain technology.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/walkers-projects-d6b89261/v0-escrow)

## Overview

This decentralized escrow application enables secure transactions between buyers and sellers using smart contracts. It provides a trustless environment for conducting business transactions with built-in escrow functionality.

## Features

- **Secure Escrow System**: Smart contract-based escrow system for secure transactions
- **User Roles**: Dedicated interfaces for buyers and sellers
- **Product Management**: List and browse products
- **Order Tracking**: Monitor transaction status and order progress
- **Wallet Integration**: Connect with MetaMask and WalletConnect
- **MySQL Database**: Robust data storage for off-chain information

## Tech Stack

- **Frontend**: Next.js, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: MySQL
- **Blockchain**: Ethereum (Web3)
- **Authentication**: Wallet-based authentication
- **UI Components**: Custom shadcn/ui components

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
4. Set up MySQL database:
   - Follow instructions in [MYSQL_SETUP_GUIDE.md](MYSQL_SETUP_GUIDE.md)
   - Run initialization script: `scripts/mysql/001_init.sql`

5. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
├── app/                  # Next.js app directory
│   ├── api/             # API routes
│   ├── buyer/           # Buyer interface
│   ├── seller/          # Seller interface
│   └── escrow/          # Escrow management
├── components/          # React components
├── lib/                 # Utility functions
├── public/             # Static assets
├── scripts/            # Database scripts
└── styles/             # Global styles
```

## Deployment

The application is deployed on Vercel:
[https://vercel.com/walkers-projects-d6b89261/v0-escrow](https://vercel.com/walkers-projects-d6b89261/v0-escrow)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.
