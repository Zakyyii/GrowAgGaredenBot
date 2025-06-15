# 🌱 Garden Discord Bot - Quick Start Guide

## Setup Instructions

### 1. Get Your Discord Bot Token

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name (e.g., "Garden Monitor")
3. Go to the "Bot" section in the left sidebar
4. Click "Add Bot" (if not already created)
5. Under "Token", click "Copy" to copy your bot token
6. **Keep this token secret and secure!**

### 2. Configure the Bot

1. Open the `.env` file in your text editor
2. Replace `your_discord_bot_token_here` with your actual bot token:
   ```
   DISCORD_TOKEN=your_actual_bot_token_here
   ```
3. Save the file

### 3. Invite the Bot to Your Server (Optional)

1. In the Discord Developer Portal, go to "OAuth2" → "URL Generator"
2. Under "Scopes", select "bot"
3. Under "Bot Permissions", select:
   - Send Messages
   - Read Message History
   - Embed Links
   - Use External Emojis
4. Copy the generated URL and open it in your browser
5. Select your server and authorize the bot

## Running the Bot

```bash
npm start
```

The bot will:
- ✅ Connect to Discord
- 🔄 Start monitoring the Garden API every 2 minutes
- 🌤️ Check weather events every minute
- 👀 Alert users when their watched items are available

## Commands Overview

### Basic Information
| Command | Description | Example |
|---------|-------------|---------|
| `!garden help` | Show all commands | `!garden help` |
| `!garden stock` | View current stock | `!garden stock` |
| `!garden weather` | Check weather status | `!garden weather` |
| `!garden restock` | See restock times | `!garden restock` |

### Watchlist Management  
| Command | Description | Example |
|---------|-------------|---------|
| `!garden watch <item>` | Watch for an item | `!garden watch Watermelon` |
| `!garden unwatch <item>` | Stop watching item | `!garden unwatch Watermelon` |
| `!garden watchlist` | View your watchlist | `!garden watchlist` |

### Data Management
| Command | Description | Example |
|---------|-------------|---------|
| `!garden save` | Force save data | `!garden save` |
| `!garden stats` | View bot statistics | `!garden stats` |
| `!garden export` | Export data backup | `!garden export` |

## Example Usage

### Check What's in Stock
```
!garden stock
```
Response: Shows organized embed with all current stock across categories

### Monitor Weather
```
!garden weather
```
Response: Shows active weather events and their remaining duration

### Set Up Item Alerts
```
!garden watch Dragon Fruit
!garden watch Mango
!garden watch Master Sprinkler
```
The bot will DM you when these items become available!

### Check Restock Times
```
!garden restock
```
Response: Shows countdown timers for when each category restocks

## Features

### 🔄 Automatic Monitoring
- **Stock Changes**: Detects when new items appear or quantities change
- **Weather Events**: Alerts when weather starts or ends
- **Personal Alerts**: DMs you when watched items are available
- **Data Persistence**: All data is automatically saved and restored on restart

### 📊 Rich Information Display
- **Organized Stock View**: Items grouped by category with emojis
- **Weather Status**: Active events with time remaining
- **Restock Timers**: Countdown to next restock for each category

### 👀 Personal Watchlists
- **Individual Lists**: Each user has their own watchlist
- **Smart Matching**: Finds items even with partial name matches
- **DM Notifications**: Private alerts when items are found

## Troubleshooting

### Bot Won't Start
- ❌ **Error**: "DISCORD_TOKEN not found"
  - ✅ **Fix**: Make sure your `.env` file has the correct token

- ❌ **Error**: "Failed to login to Discord"
  - ✅ **Fix**: Check that your token is valid and not expired

### Bot Not Responding to Commands
- ❌ **Issue**: Bot online but doesn't respond
  - ✅ **Fix**: Make sure the bot has permission to read and send messages in the channel

### API Errors
- ❌ **Error**: "Failed to fetch stock information"
  - ✅ **Fix**: Check your internet connection; the Garden API might be temporarily down

## Support

If you need help:
1. Check this guide first
2. Run `npm run test-api` to verify the Garden APIs are working
3. Check the console output for error messages
4. Make sure your Discord bot token is correctly configured

## Tips

- **Use specific item names** when setting up watchlists (e.g., "Dragon Fruit" instead of "dragon")
- **The bot works best in servers** where it has proper permissions
- **Watchlist notifications are sent via DM** - make sure you can receive DMs from the bot
- **Stock changes are checked every 2 minutes** - notifications aren't instant but are very timely
