# Earn Backend

A minimal Node.js TypeScript backend project.

## Requirements

- Node.js (current version)
- pnpm

## Installation

```bash
pnpm install
```

## Scripts

- **Development**: Run with hot reload
  ```bash
  pnpm dev
  ```

- **Build**: Compile TypeScript to JavaScript
  ```bash
  pnpm build
  ```

- **Start**: Run the compiled JavaScript
  ```bash
  pnpm start
  ```

## API Endpoints

### GET `/getmarketslist`
Returns a list of available markets.

**Response:**
```json
{
  "markets": ["aave-usdt", "aave-usdc", "echelon-usdt", "echelon-usdc"]
}
```

**Example:**
```bash
curl http://localhost:3000/getmarketslist
```

### GET `/getuserportfolio/:address`
Returns portfolio data for a given user address (currently returns hardcoded data).

**Parameters:**
- `address` - User wallet address

**Response:**
```json
{
  "userAddress": "0x...",
  "totalValue": 125000.50,
  "positions": [
    {
      "market": "aave-usdt",
      "amount": 5000,
      "value": 45000.25,
      "apy": 8.5
    }
  ],
  "lastUpdated": "2025-11-18T12:00:00.000Z"
}
```

**Example:**
```bash
curl http://localhost:3000/getuserportfolio/0x1234567890abcdef
```

## Project Structure

```
earn-backend/
├── src/
│   └── index.ts       # Main entry point with API endpoints
├── dist/              # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── README.md
```

