# The Arbiter - Autonomous Trading Dashboard

Complete web interface for The Arbiter RAG-based trading agent on Binance.

## Architecture

```
Frontend (React + Vite)  ←─ WebSocket ─→  Backend (Express + Socket.io)
        ↓                                           ↓
  Dashboard UI                              Arbiter Service
   - Real-time status                            ↓
   - Position tracking                    ┌──────┴──────┐
   - Trade controls                       ↓             ↓
   - Price charts                    Pinecone      Binance
```

## Quick Start

### 1. Install Dependencies

**Frontend:**
```bash
cd frontend
npm install
```

**Backend:**
```bash
cd backend
npm install
```

### 2. Environment Setup

Create `.env` in backend directory (copy from `.env.example`):
```bash
cd backend
cp .env.example .env
# Edit .env with your API keys
```

### 3. Run Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Access Dashboard:**
```
http://localhost:3000
```

## Features

### Real-Time Dashboard
- ✅ Live system status monitoring
- ✅ Kill threshold proximity warnings
- ✅ Active position cards with P&L
- ✅ Real-time price charts
- ✅ Trade history table
- ✅ WebSocket connection indicator

### Control Panel
- ✅ Start/Pause/Stop agent
- ✅ Double-click confirmation for stop
- ✅ State validation (cannot restart terminated)
- ✅ Visual feedback (< 400ms)

### Safety Features
- ✅ Kill threshold auto-termination (-15%)
- ✅ Error prevention (confirmation dialogs)
- ✅ Connection monitoring
- ✅ Graceful shutdown handling

## Tech Stack

### Frontend
- **React 18** + TypeScript
- **Vite** - Fast build tool
- **TailwindCSS** - Utility-first styling
- **Recharts** - Trading charts
- **Socket.io-client** - WebSocket
- **Zustand** - State management
- **Lucide React** - Icons

### Backend
- **Node.js** + Express
- **Socket.io** - WebSocket server
- **TypeScript** - Type safety
- **Arbiter Agent** - Trading logic

## UI/UX Principles Applied

### CRAP Design
- **Contrast**: Color-coded states (green=operational, yellow=paused, red=terminated)
- **Repetition**: Consistent card styling across components
- **Alignment**: Grid-based layouts
- **Proximity**: Related metrics grouped together

### Fitts's Law
- Large touch targets for critical actions
- Most important buttons are biggest
- Easy-to-click controls

### Doherty Threshold
- All feedback < 400ms
- Real-time WebSocket updates
- Smooth animations (300ms)

### Visual Hierarchy
- Critical metrics at top (P&L, kill threshold)
- Important data in center (positions)
- Reference data at bottom (history)

## API Endpoints

### REST API (Port 4000)
```
GET  /health              - Health check
GET  /api/status          - System status
GET  /api/positions       - Active positions
GET  /api/trades?limit=50 - Trade history
POST /api/control/start   - Start agent
POST /api/control/pause   - Pause agent
POST /api/control/stop    - Terminate agent
```

### WebSocket Events

**From Backend:**
```
system:status      - Status updates
position:update    - Position changes
trade:executed     - New trade notifications
market:data        - Real-time price data
error              - Error messages
```

**To Backend:**
```
control:start      - Start trading
control:pause      - Pause trading
control:stop       - Terminate agent
```

## Development

### Frontend Development
```bash
cd frontend
npm run dev     # Start dev server
npm run build   # Build for production
npm run preview # Preview production build
```

### Backend Development
```bash
cd backend
npm run dev     # Watch mode with tsx
npm run build   # Compile TypeScript
npm start       # Run compiled code
```

## Demo Mode

Test the UI without real trading:

```bash
# In backend/.env
DEMO_MODE=true
```

This simulates:
- Random trade executions every 5 seconds
- Market data updates
- Position P&L changes
- All WebSocket events

## Color System

```css
background: #0A0E27  /* Dark blue-black */
surface:    #1A1F3A  /* Lighter surface */
primary:    #3B82F6  /* Blue */
success:    #10B981  /* Green (profit/buy) */
warning:    #F59E0B  /* Yellow (pause) */
danger:     #EF4444  /* Red (loss/sell/stop) */
```

## Project Structure

```
pinecone agent/
├── frontend/                    # React dashboard
│   ├── src/
│   │   ├── components/         # UI components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── StatusIndicator.tsx
│   │   │   ├── TradeCard.tsx
│   │   │   ├── ControlPanel.tsx
│   │   │   ├── PositionTable.tsx
│   │   │   └── PriceChart.tsx
│   │   ├── hooks/
│   │   │   └── useWebSocket.ts
│   │   ├── store/
│   │   │   └── tradeStore.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── backend/                     # Express + Socket.io
│   ├── src/
│   │   ├── api/
│   │   │   ├── server.ts
│   │   │   ├── routes.ts
│   │   │   └── websocket.ts
│   │   ├── services/
│   │   │   └── arbiter-service.ts
│   │   └── main.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
└── shared/                      # Shared types
    └── types.ts
```

## Next Steps

### Integration Tasks
1. Connect ArbiterService to existing agent code
2. Integrate Pinecone client
3. Add Binance WebSocket connection
4. Implement real trading logic

### Enhancements
1. Authentication (JWT/OAuth)
2. Trade notifications (browser push, Telegram)
3. Backtesting results viewer
4. Strategy configuration panel
5. Multi-symbol support
6. Advanced charting (candlesticks, indicators)
7. Trade alerts and webhooks

## Troubleshooting

### WebSocket Not Connecting
- Check backend is running on port 4000
- Verify CORS settings in backend/src/api/server.ts
- Check browser console for errors

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors
```bash
# Rebuild TypeScript
npm run build
```

## License

MIT

## Support

For issues or questions:
1. Check browser console for errors
2. Check backend logs
3. Verify environment variables
4. Enable demo mode for testing

---

**Built with production-ready code following clean architecture principles.**
