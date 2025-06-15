<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Garden Discord Bot - Copilot Instructions

This is a Discord user bot project that monitors the Grow a Garden API and provides real-time notifications.

## Project Context
- **Framework**: Discord.js v14
- **Language**: JavaScript (Node.js)
- **Main Purpose**: API monitoring and Discord notifications
- **APIs Used**: Grow a Garden API endpoints for stock, weather, items, and restock times

## Key Components
- **Main Bot Class**: `GardenBot` - handles all bot functionality
- **API Monitoring**: Scheduled checks using node-cron
- **User Watchlists**: Personal item tracking with DM notifications
- **Command System**: Prefix-based commands starting with `!garden`

## Code Patterns
- Use async/await for API calls and Discord operations
- Implement error handling for all external API calls
- Use Discord.js embeds for rich message formatting
- Store user data in Maps for runtime persistence
- Use environment variables for configuration

## API Integration
- All API endpoints return JSON data
- Stock data includes multiple categories: seeds, gear, eggs, etc.
- Weather data includes active/inactive states with Unix timestamps
- Implement comparison logic to detect changes between API calls

## Discord Features
- Message commands with argument parsing
- Embed-based responses for better formatting
- DM notifications for watchlist alerts
- Scheduled monitoring using cron jobs

When suggesting code improvements or new features, consider:
- Rate limiting for Discord API calls
- Error resilience for API failures
- User experience with clear command feedback
- Performance optimization for data comparison
- Security for user data handling
