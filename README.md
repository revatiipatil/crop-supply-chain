# Crop Supply Chain

A blockchain-based supply chain management system for agricultural products, built with React, Node.js, and Solana.

## Features

- Farmer registration and profile management
- Crop registration and tracking
- Wallet integration with Phantom
- Real-time SOL balance tracking
- User-friendly dashboard interface

## Tech Stack

### Frontend
- React.js
- Material-UI
- Solana Web3.js
- Vite

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Phantom Wallet browser extension
- Solana CLI (optional)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/crop-supply-chain.git
cd crop-supply-chain
```

2. Install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables:
Create `.env` files in both backend and frontend directories:

Backend `.env`:
```
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

Frontend `.env`:
```
VITE_API_URL=http://localhost:5000/api
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
```

4. Start the development servers:

```bash
# Start backend server
cd backend
npm run dev

# Start frontend server
cd frontend
npm run dev
```

## Usage

1. Open your browser and navigate to `http://localhost:5173`
2. Install Phantom Wallet browser extension if you haven't already
3. Connect your Phantom wallet to the Solana devnet
4. Register as a farmer and start managing your crops

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Solana Blockchain
- Material-UI
- React.js
- MongoDB 
