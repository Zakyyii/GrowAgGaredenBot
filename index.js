const { Client } = require('discord.js');
const axios = require('axios');
const cron = require('node-cron');
const DataManager = require('./data-manager');
require('dotenv').config();

class GardenBot {
    constructor() {
        this.client = new Client({
            intents: ['Guilds', 'GuildMessages', 'MessageContent']
        });
        
        // Initialize data manager for persistence
        this.dataManager = new DataManager();
        
        // API endpoints
        this.apiEndpoints = {
            stock: 'https://growagardenapi.vercel.app/api/stock/GetStock',
            weather: 'https://growagardenapi.vercel.app/api/GetWeather',
            itemInfo: 'https://growagardenapi.vercel.app/api/Item-Info',
            restockTime: 'https://growagardenapi.vercel.app/api/stock/Restock-Time'
        };
        
        // Store previous data for comparison
        this.previousData = {
            stock: null,
            weather: null
        };
        
        // User preferences for item alerts
        this.userWatchlists = new Map();
        
        // Auto-save intervals
        this.saveInterval = null;
        
        this.init();
    }
      async init() {
        await this.loadPersistedData();
        await this.setupEventListeners();
        await this.login();
        this.startMonitoring();
        this.startAutoSave();
    }
    
    async setupEventListeners() {
        this.client.on('ready', () => {
            console.log(`🌱 ${this.client.user.tag} is ready to monitor the garden!`);
            this.client.user.setActivity('🌱 Monitoring Garden Stock', { type: 'WATCHING' });
        });
        
        this.client.on('messageCreate', async (message) => {
            if (message.author.bot) return;
            
            const content = message.content.toLowerCase();
            
            // Commands
            if (content.startsWith('!garden')) {
                await this.handleCommand(message);
            }
        });
    }
    
    async handleCommand(message) {
        const args = message.content.slice(8).trim().split(/ +/);
        const command = args[0]?.toLowerCase();
          switch (command) {
            case 'stock':
                await this.sendStockInfo(message);
                break;
            case 'weather':
                await this.sendWeatherInfo(message);
                break;
            case 'restock':
                await this.sendRestockInfo(message);
                break;
            case 'watch':
                await this.handleWatchCommand(message, args);
                break;
            case 'unwatch':
                await this.handleUnwatchCommand(message, args);
                break;
            case 'watchlist':
                await this.showWatchlist(message);
                break;
            case 'save':
                await this.handleSaveCommand(message);
                break;
            case 'stats':
                await this.handleStatsCommand(message);
                break;
            case 'export':
                await this.handleExportCommand(message);
                break;
            case 'help':
                await this.sendHelp(message);
                break;
            default:
                await message.reply('❓ Unknown command. Use `!garden help` for available commands.');
        }
    }
    
    async sendStockInfo(message) {
        try {
            const response = await axios.get(this.apiEndpoints.stock);
            const data = response.data;
            
            let embed = {
                title: '🏪 Current Garden Stock',
                color: 0x4CAF50,
                timestamp: new Date(),
                fields: []
            };
            
            // Seeds Stock
            if (data.seedsStock && data.seedsStock.length > 0) {
                const seedsText = data.seedsStock.map(item => 
                    `${item.emoji || '🌱'} **${item.name}**: ${item.value}`
                ).join('\n');
                embed.fields.push({
                    name: '🌱 Seeds',
                    value: seedsText,
                    inline: true
                });
            }
            
            // Gear Stock
            if (data.gearStock && data.gearStock.length > 0) {
                const gearText = data.gearStock.map(item =>
                    `${item.emoji || '🛠️'} **${item.name}**: ${item.value}`
                ).join('\n');
                embed.fields.push({
                    name: '🛠️ Gear',
                    value: gearText,
                    inline: true
                });
            }
            
            // Egg Stock
            if (data.eggStock && data.eggStock.length > 0) {
                const eggText = data.eggStock.map(item =>
                    `${item.emoji || '🥚'} **${item.name}**: ${item.value}`
                ).join('\n');
                embed.fields.push({
                    name: '🥚 Eggs',
                    value: eggText,
                    inline: true
                });
            }
            
            // Special Stocks
            if (data.nightStock && data.nightStock.length > 0) {
                const nightText = data.nightStock.map(item =>
                    `🌙 **${item.name}**: ${item.value}`
                ).join('\n');
                embed.fields.push({
                    name: '🌙 Night Items',
                    value: nightText,
                    inline: true
                });
            }
            
            if (data.honeyStock && data.honeyStock.length > 0) {
                const honeyText = data.honeyStock.map(item =>
                    `🍯 **${item.name}**: ${item.value}`
                ).join('\n');
                embed.fields.push({
                    name: '🍯 Honey Items',
                    value: honeyText,
                    inline: true
                });
            }
            
            await message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching stock:', error);
            await message.reply('❌ Failed to fetch stock information.');
        }
    }
    
    async sendWeatherInfo(message) {
        try {
            const response = await axios.get(this.apiEndpoints.weather);
            const data = response.data;
            
            if (!data.success) {
                await message.reply('❌ Failed to fetch weather information.');
                return;
            }
            
            const activeWeather = data.weather.filter(w => w.active);
            const inactiveWeather = data.weather.filter(w => !w.active);
            
            let embed = {
                title: '🌤️ Garden Weather Status',
                color: 0x2196F3,
                timestamp: new Date(),
                fields: []
            };
            
            if (activeWeather.length > 0) {
                const activeText = activeWeather.map(w => {
                    const endTime = new Date(w.end_duration_unix * 1000);
                    const timeLeft = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
                    const minutes = Math.floor(timeLeft / 60);
                    const seconds = timeLeft % 60;
                    return `⚡ **${w.weather_name}** - ${minutes}m ${seconds}s left`;
                }).join('\n');
                
                embed.fields.push({
                    name: '🌩️ Active Weather',
                    value: activeText,
                    inline: false
                });
            } else {
                embed.fields.push({
                    name: '☀️ Current Weather',
                    value: 'Clear skies - no active weather events',
                    inline: false
                });
            }
            
            // Show next possible weather events
            const nextEvents = inactiveWeather.slice(0, 5).map(w => 
                `${this.getWeatherEmoji(w.weather_name)} ${w.weather_name}`
            ).join('\n');
            
            if (nextEvents) {
                embed.fields.push({
                    name: '🔮 Possible Weather Events',
                    value: nextEvents,
                    inline: false
                });
            }
            
            await message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching weather:', error);
            await message.reply('❌ Failed to fetch weather information.');
        }
    }
    
    async sendRestockInfo(message) {
        try {
            const response = await axios.get(this.apiEndpoints.restockTime);
            const data = response.data;
            
            let embed = {
                title: '⏰ Restock Information',
                color: 0xFF9800,
                timestamp: new Date(),
                fields: []
            };
            
            const categories = ['seeds', 'gear', 'egg', 'cosmetic'];
            
            categories.forEach(category => {
                if (data[category]) {
                    const info = data[category];
                    embed.fields.push({
                        name: `${this.getCategoryEmoji(category)} ${category.charAt(0).toUpperCase() + category.slice(1)}`,
                        value: `⏱️ Next restock: **${info.countdown}**\n📅 Last restock: ${info.LastRestock} (${info.timeSinceLastRestock})`,
                        inline: true
                    });
                }
            });
            
            await message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching restock info:', error);
            await message.reply('❌ Failed to fetch restock information.');
        }
    }
    
    async handleWatchCommand(message, args) {
        if (args.length < 2) {
            await message.reply('❓ Usage: `!garden watch <item_name>`\nExample: `!garden watch Watermelon`');
            return;
        }
        
        const itemName = args.slice(1).join(' ');
        const userId = message.author.id;
        
        if (!this.userWatchlists.has(userId)) {
            this.userWatchlists.set(userId, new Set());
        }
        
        const userWatchlist = this.userWatchlists.get(userId);
        
        if (userWatchlist.has(itemName.toLowerCase())) {
            await message.reply(`👀 You're already watching **${itemName}**!`);
            return;
        }
          userWatchlist.add(itemName.toLowerCase());
        await message.reply(`✅ Added **${itemName}** to your watchlist! I'll notify you when it's available in stock.`);
        
        // Auto-save after watchlist change
        await this.saveData();
    }
    
    async handleUnwatchCommand(message, args) {
        if (args.length < 2) {
            await message.reply('❓ Usage: `!garden unwatch <item_name>`\nExample: `!garden unwatch Watermelon`');
            return;
        }
        
        const itemName = args.slice(1).join(' ');
        const userId = message.author.id;
        
        if (!this.userWatchlists.has(userId)) {
            await message.reply('📝 Your watchlist is empty.');
            return;
        }
        
        const userWatchlist = this.userWatchlists.get(userId);
        
        if (!userWatchlist.has(itemName.toLowerCase())) {
            await message.reply(`❌ **${itemName}** is not in your watchlist.`);
            return;
        }
          userWatchlist.delete(itemName.toLowerCase());
        await message.reply(`✅ Removed **${itemName}** from your watchlist.`);
        
        // Auto-save after watchlist change
        await this.saveData();
    }
    
    async showWatchlist(message) {
        const userId = message.author.id;
        
        if (!this.userWatchlists.has(userId) || this.userWatchlists.get(userId).size === 0) {
            await message.reply('📝 Your watchlist is empty. Use `!garden watch <item_name>` to add items.');
            return;
        }
        
        const watchlist = Array.from(this.userWatchlists.get(userId));
        const embed = {
            title: '👀 Your Watchlist',
            description: watchlist.map(item => `• ${item}`).join('\n'),
            color: 0x9C27B0,
            timestamp: new Date()
        };
        
        await message.reply({ embeds: [embed] });
    }
      async sendHelp(message) {
        const embed = {
            title: '🌱 Garden Bot Commands',
            color: 0x4CAF50,
            fields: [
                {
                    name: '📊 Information Commands',
                    value: '`!garden stock` - View current stock\n`!garden weather` - Check weather status\n`!garden restock` - See restock times',
                    inline: false
                },
                {
                    name: '👀 Watchlist Commands',
                    value: '`!garden watch <item>` - Watch for item availability\n`!garden unwatch <item>` - Stop watching item\n`!garden watchlist` - View your watchlist',
                    inline: false
                },
                {
                    name: '💾 Data Management',
                    value: '`!garden save` - Force save data\n`!garden stats` - Show bot statistics\n`!garden export` - Export data backup',
                    inline: false
                },
                {
                    name: '❓ Other Commands',
                    value: '`!garden help` - Show this help message',
                    inline: false
                }
            ],
            footer: {
                text: 'The bot automatically saves data every 5 minutes and monitors stock changes!'
            }
        };
        
        await message.reply({ embeds: [embed] });
    }
    
    startMonitoring() {
        // Check stock every 2 minutes
        cron.schedule('*/2 * * * *', async () => {
            await this.checkStockChanges();
        });
        
        // Check weather every minute
        cron.schedule('*/1 * * * *', async () => {
            await this.checkWeatherChanges();
        });
        
        console.log('🔄 Started monitoring garden data...');
    }
    
    async checkStockChanges() {
        try {
            const response = await axios.get(this.apiEndpoints.stock);
            const currentStock = response.data;
            
            if (this.previousData.stock) {
                await this.compareStockAndNotify(this.previousData.stock, currentStock);
            }
            
            this.previousData.stock = currentStock;
        } catch (error) {
            console.error('Error checking stock changes:', error);
        }
    }
    
    async checkWeatherChanges() {
        try {
            const response = await axios.get(this.apiEndpoints.weather);
            const currentWeather = response.data;
            
            if (this.previousData.weather) {
                await this.compareWeatherAndNotify(this.previousData.weather, currentWeather);
            }
            
            this.previousData.weather = currentWeather;
        } catch (error) {
            console.error('Error checking weather changes:', error);
        }
    }
    
    async compareStockAndNotify(previous, current) {
        // Check for new items in stock
        const allStockTypes = ['seedsStock', 'gearStock', 'eggStock', 'nightStock', 'honeyStock'];
        
        allStockTypes.forEach(stockType => {
            if (current[stockType] && previous[stockType]) {
                current[stockType].forEach(currentItem => {
                    const previousItem = previous[stockType].find(p => p.name === currentItem.name);
                    
                    if (!previousItem) {
                        // New item in stock
                        this.notifyNewItem(currentItem, stockType);
                    } else if (previousItem.value !== currentItem.value) {
                        // Stock quantity changed
                        this.notifyStockChange(currentItem, previousItem, stockType);
                    }
                });
            }
        });
        
        // Check watchlists
        this.checkWatchlistItems(current);
    }
    
    async compareWeatherAndNotify(previous, current) {
        if (!current.success || !previous.success) return;
        
        const currentActive = current.weather.filter(w => w.active);
        const previousActive = previous.weather.filter(w => w.active);
        
        // Check for new active weather
        currentActive.forEach(weather => {
            const wasActive = previousActive.some(p => p.weather_id === weather.weather_id);
            if (!wasActive) {
                this.notifyWeatherStart(weather);
            }
        });
        
        // Check for ended weather
        previousActive.forEach(weather => {
            const stillActive = currentActive.some(c => c.weather_id === weather.weather_id);
            if (!stillActive) {
                this.notifyWeatherEnd(weather);
            }
        });
    }
    
    async checkWatchlistItems(stockData) {
        const allStockTypes = ['seedsStock', 'gearStock', 'eggStock', 'nightStock', 'honeyStock'];
        
        for (const [userId, watchlist] of this.userWatchlists.entries()) {
            for (const watchedItem of watchlist) {
                for (const stockType of allStockTypes) {
                    if (stockData[stockType]) {
                        const foundItem = stockData[stockType].find(item => 
                            item.name.toLowerCase().includes(watchedItem) || 
                            watchedItem.includes(item.name.toLowerCase())
                        );
                        
                        if (foundItem && foundItem.value > 0) {
                            await this.notifyWatchlistMatch(userId, foundItem, stockType);
                        }
                    }
                }
            }
        }
    }
    
    async notifyNewItem(item, stockType) {
        const channels = await this.getNotificationChannels();
        const emoji = item.emoji || this.getStockTypeEmoji(stockType);
        
        channels.forEach(channel => {
            channel.send(`🆕 **New in stock!** ${emoji} **${item.name}** (${item.value} available)`);
        });
    }
    
    async notifyStockChange(currentItem, previousItem, stockType) {
        const channels = await this.getNotificationChannels();
        const emoji = currentItem.emoji || this.getStockTypeEmoji(stockType);
        const change = currentItem.value - previousItem.value;
        const changeText = change > 0 ? `+${change}` : `${change}`;
        console.log(`Stock change for ${currentItem.name}: ${previousItem.value} → ${currentItem.value} (${changeText})`);
        channels.forEach(channel => {
            channel.send(`📊 **Stock Update** ${emoji} **${currentItem.name}**: ${previousItem.value} → ${currentItem.value} (${changeText})`);
        });
    }
    
    async notifyWeatherStart(weather) {
        const channels = await this.getNotificationChannels();
        const emoji = this.getWeatherEmoji(weather.weather_name);
        
        channels.forEach(channel => {
            channel.send(`🌩️ **Weather Alert!** ${emoji} **${weather.weather_name}** has started! Duration: ${weather.duration} seconds`);
        });
    }
    
    async notifyWeatherEnd(weather) {
        const channels = await this.getNotificationChannels();
        const emoji = this.getWeatherEmoji(weather.weather_name);
        
        channels.forEach(channel => {
            channel.send(`☀️ **Weather Update** ${emoji} **${weather.weather_name}** has ended.`);
        });
    }
    
    async notifyWatchlistMatch(userId, item, stockType) {
        try {
            const user = await this.client.users.fetch(userId);
            const emoji = item.emoji || this.getStockTypeEmoji(stockType);
            
            await user.send(`🎯 **Watchlist Alert!** ${emoji} **${item.name}** is now available in stock! (${item.value} available)`);
        } catch (error) {
            console.error(`Failed to notify user ${userId}:`, error);
        }
    }
    
    async getNotificationChannels() {
        // from .env file or config NOTIFICATION_CHANNELS # Optional: Set notification channels (comma-separated channel IDs)

        const channelIds = process.env.NOTIFICATION_CHANNELS ? process.env.NOTIFICATION_CHANNELS.split(',') : [];
        const channels = [];
        for (const channelId of channelIds) {
            const channel = await this.client.channels.fetch(channelId.trim());
            if (channel && (channel.type === 0 || channel.type === 5 || channel.type === 11 || channel.type === 12)) {
                channels.push(channel);
            } else {
                console.warn(`⚠️ Invalid notification channel ID: ${channelId}`);
            }
        }
        return channels;
    }
    
    getStockTypeEmoji(stockType) {
        const emojis = {
            seedsStock: '🌱',
            gearStock: '🛠️',
            eggStock: '🥚',
            nightStock: '🌙',
            honeyStock: '🍯',
            cosmeticsStock: '✨'
        };
        return emojis[stockType] || '📦';
    }
    
    getCategoryEmoji(category) {
        const emojis = {
            seeds: '🌱',
            gear: '🛠️',
            egg: '🥚',
            cosmetic: '✨'
        };
        return emojis[category] || '📦';
    }
    
    getWeatherEmoji(weatherName) {
        const emojis = {
            'Rain': '🌧️',
            'Thunderstorm': '🌩️',
            'Frost': '❄️',
            'Meteorshower': '🌠',
            'BeeSwarm': '🐝',
            'Disco': '🕺',
            'JandelStorm': '👡',
            'Blackhole': '🕳️'
        };
        return emojis[weatherName] || '🌤️';
    }
    
    async login() {
        if (!process.env.DISCORD_TOKEN) {
            console.error('❌ DISCORD_TOKEN not found in environment variables!');
            console.log('Please create a .env file with your Discord bot token:');
            console.log('DISCORD_TOKEN=your_bot_token_here');
            process.exit(1);
        }
        
        try {
            await this.client.login(process.env.DISCORD_TOKEN);
        } catch (error) {
            console.error('❌ Failed to login to Discord:', error);
            process.exit(1);
        }
    }
    
    async loadPersistedData() {
        try {
            console.log('📖 Loading persisted data...');
            
            // Load user watchlists
            this.userWatchlists = await this.dataManager.loadWatchlists();
            
            // Load previous monitoring data
            this.previousData = await this.dataManager.loadMonitoringData();
            
            console.log('✅ Data loaded successfully');
            
            // Show stats
            const stats = await this.dataManager.getStats();
            if (stats) {
                console.log(`📊 Data Stats: ${stats.totalUsers} users, ${stats.totalWatchedItems} watched items`);
            }
        } catch (error) {
            console.error('❌ Failed to load persisted data:', error);
            // Continue with empty data
            this.userWatchlists = new Map();
            this.previousData = { stock: null, weather: null };
        }
    }
    
    async saveData() {
        try {
            // Save watchlists
            await this.dataManager.saveWatchlists(this.userWatchlists);
            
            // Save monitoring data
            await this.dataManager.saveMonitoringData(this.previousData);
            
            console.log('💾 Data saved successfully');
        } catch (error) {
            console.error('❌ Failed to save data:', error);
        }
    }
    
    startAutoSave() {
        // Auto-save every 5 minutes
        this.saveInterval = setInterval(async () => {
            await this.saveData();
        }, 5 * 60 * 1000);
        
        // Save on process exit
        process.on('SIGINT', async () => {
            console.log('\n🛑 Shutting down bot...');
            await this.saveData();
            await this.dataManager.cleanupBackups();
            console.log('✅ Data saved. Goodbye!');
            process.exit(0);
        });
        
        process.on('SIGTERM', async () => {
            console.log('\n🛑 Received SIGTERM, shutting down...');
            await this.saveData();
            await this.dataManager.cleanupBackups();
            process.exit(0);
        });
        
        console.log('💾 Auto-save enabled (every 5 minutes)');
    }
    
    async handleSaveCommand(message) {
        try {
            await this.saveData();
            await message.reply('💾 ✅ Data saved successfully!');
        } catch (error) {
            console.error('Save command error:', error);
            await message.reply('❌ Failed to save data. Check console for details.');
        }
    }
    
    async handleStatsCommand(message) {
        try {
            const stats = await this.dataManager.getStats();
            
            if (!stats) {
                await message.reply('❌ Failed to get statistics.');
                return;
            }
            
            const embed = {
                title: '📊 Bot Statistics',
                color: 0x9C27B0,
                timestamp: new Date(),
                fields: [
                    {
                        name: '👥 Users',
                        value: `${stats.totalUsers} users with watchlists`,
                        inline: true
                    },
                    {
                        name: '👀 Watched Items',
                        value: `${stats.totalWatchedItems} total items`,
                        inline: true
                    },
                    {
                        name: '📈 Average',
                        value: `${stats.avgItemsPerUser} items per user`,
                        inline: true
                    },
                    {
                        name: '💾 Data Files',
                        value: `Watchlists: ${stats.dataFiles.watchlists ? '✅' : '❌'}\nMonitoring: ${stats.dataFiles.monitoring ? '✅' : '❌'}`,
                        inline: false
                    }
                ]
            };
            
            await message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Stats command error:', error);
            await message.reply('❌ Failed to get statistics.');
        }
    }
    
    async handleExportCommand(message) {
        try {
            const exportData = await this.dataManager.exportAllData();
            
            if (!exportData) {
                await message.reply('❌ Failed to export data.');
                return;
            }
            
            const filename = `garden-bot-export-${new Date().toISOString().split('T')[0]}.json`;
            const buffer = Buffer.from(JSON.stringify(exportData, null, 2));
            
            await message.reply({
                content: '📤 Here\'s your data export backup:',
                files: [{
                    attachment: buffer,
                    name: filename
                }]
            });
        } catch (error) {
            console.error('Export command error:', error);
            await message.reply('❌ Failed to export data. The file might be too large or there was an error.');
        }
    }
}

// Start the bot
const bot = new GardenBot();
