# Garden Discord Bot

A Discord user bot that monitors the Grow a Garden API and provides real-time notifications about stock changes, weather events, and item availability.

## Features

### 🔍 API Monitoring
- **Stock Monitoring**: Tracks changes in seeds, gear, eggs, and special items
- **Weather Tracking**: Monitors active weather events and duration
- **Restock Times**: Shows when different categories will restock
- **Item Information**: Access to detailed item data

### 👀 Watchlist System
- **Personal Watchlists**: Each user can create their own watchlist
- **Smart Notifications**: Get DM'd when watched items become available
- **Easy Management**: Add/remove items with simple commands
- **Data Persistence**: Watchlists are automatically saved and restored on bot restart

### 💾 Data Management
- **Auto-Save**: Data is saved every 5 minutes automatically
- **Graceful Shutdown**: Data is saved when bot is stopped
- **Backup System**: Automatic backups with cleanup of old files
- **Export/Import**: Manual data backup and restore capabilities
- **Recovery Tools**: Built-in data recovery and validation tools

### 🤖 Commands

#### Information Commands
- `!garden stock` - View current stock across all categories
- `!garden weather` - Check active weather events and their duration
- `!garden restock` - See restock countdown timers for all categories
- `!garden help` - Show all available commands

#### Watchlist Commands
- `!garden watch <item_name>` - Add an item to your personal watchlist
- `!garden unwatch <item_name>` - Remove an item from your watchlist
- `!garden watchlist` - View all items in your watchlist

#### Data Management Commands
- `!garden save` - Force save all data immediately
- `!garden stats` - Show bot statistics and data info
- `!garden export` - Export your data as a backup file

### 🔄 Automatic Monitoring
- **Stock Changes**: Monitors stock every 2 minutes and notifies of changes
- **Weather Events**: Checks weather every minute for new/ending events
- **Watchlist Alerts**: Sends DM notifications when watched items become available

## Setup

### Prerequisites
- Node.js (v16 or higher)
- A Discord account
- Discord Developer Application with Bot Token

### Installation

1. **Clone or download the project**
   ```bash
   cd bot_urgarden
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your Discord bot token:
   ```
   DISCORD_TOKEN=your_discord_bot_token_here
   ```

4. **Get your Discord Bot Token**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Create a new application
   - Go to the "Bot" section
   - Create a bot and copy the token
   - Paste the token in your `.env` file

### Running the Bot

**Development mode:**
```bash
npm start
```

**Production mode:**
```bash
npm run prod
```

**Data recovery tools:**
```bash
npm run data-recovery
```

## API Endpoints Used

The bot monitors the following Grow a Garden API endpoints:

- **Stock Data**: `https://growagardenapi.vercel.app/api/stock/GetStock`
- **Weather Info**: `https://growagardenapi.vercel.app/api/GetWeather`
- **Item Details**: `https://growagardenapi.vercel.app/api/Item-Info`
- **Restock Times**: `https://growagardenapi.vercel.app/api/stock/Restock-Time`

## Data Management

### Automatic Data Persistence
The bot automatically saves all data to ensure nothing is lost during restarts:

- **Watchlists**: User preferences are saved in `data/watchlists.json`
- **Monitoring Data**: Previous API states saved in `data/monitoring-data.json`
- **Auto-Save**: Data is saved every 5 minutes and on shutdown
- **Backups**: Automatic backups stored in `data/backups/`

### Manual Data Management
```bash
# Force save data immediately
!garden save

# View bot statistics
!garden stats

# Export data backup
!garden export

# Access data recovery tools
npm run data-recovery
```

### Data Recovery
If you need to recover or manage data manually:

1. **Run recovery tool**: `npm run data-recovery`
2. **Available options**:
   - View data statistics
   - Export/import data
   - List and restore backups
   - Validate data integrity
   - Cleanup old backups

### File Structure
```
data/
├── watchlists.json      # User watchlist data
├── monitoring-data.json # Previous API states
└── backups/            # Automatic backups
    ├── watchlists_2025-06-15T10-30-00.json
    └── monitoring-data_2025-06-15T10-30-00.json
```

## Usage Examples

### Basic Stock Check
```
!garden stock
```
Shows current stock with items organized by category (Seeds, Gear, Eggs, etc.)

### Weather Monitoring
```
!garden weather
```
Displays active weather events and their remaining duration

### Setting Up Watchlist
```
!garden watch Watermelon
!garden watch Dragon Fruit
!garden watchlist
```
Adds items to your watchlist and shows what you're watching

### Checking Restock Times
```
!garden restock
```
Shows countdown timers for when each category will restock

## Bot Permissions

The bot requires these Discord permissions:
- Read Messages
- Send Messages
- Embed Links
- Send Messages in DMs (for watchlist notifications)

## Contributing

Feel free to submit issues and feature requests!

## License

ISC
