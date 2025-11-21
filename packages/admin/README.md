# AquaFund Admin Dashboard

Admin dashboard for managing NGOs, projects, and platform analytics.

## Setup

1. Install dependencies:
```bash
cd packages/admin
yarn install
```

2. Set environment variables:
```bash
# Create .env.local
BACKEND_API_URL=your_backend_url
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id
```

3. Run the development server:
```bash
yarn dev
```

The admin dashboard will be available at `http://localhost:3001`

## Features

- **NGO Approvals**: Review and approve/reject pending NGO applications
- **Smart Contract Integration**: Approve NGOs on-chain by granting VIEWER_ROLE
- **Project Management**: View and manage projects
- **Analytics**: Platform statistics and insights
- **Settings**: Admin configuration

## Admin Permissions

Only wallets with `DEFAULT_ADMIN_ROLE` in the AquaFundRegistry contract can approve NGOs.

## API Routes

- `GET /api/ngos?status=pending` - Fetch pending NGOs
- `POST /api/ngos/[id]/approve` - Approve an NGO (updates backend after on-chain approval)
- `POST /api/ngos/[id]/reject` - Reject an NGO
