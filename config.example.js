// Example configuration for the Garden Discord Bot
// Copy this file to config.js and customize as needed

module.exports = {
    // Bot settings
    bot: {
        prefix: '!garden',
        activityType: 'WATCHING', // PLAYING, STREAMING, LISTENING, WATCHING
        activityText: '🌱 Monitoring Garden Stock'
    },
    
    // Monitoring intervals (in minutes)
    monitoring: {
        stockCheckInterval: 2,
        weatherCheckInterval: 1
    },
    
    // Notification settings
    notifications: {
        // Whether to send notifications for stock changes
        stockChanges: true,
        
        // Whether to send notifications for weather events
        weatherEvents: true,
        
        // Minimum stock value to trigger notifications
        minStockThreshold: 1,
        
        // Whether to notify on stock increases only
        stockIncreaseOnly: false
    },
    
    // API settings
    api: {
        // Request timeout in milliseconds
        timeout: 10000,
        
        // Retry attempts for failed requests
        retryAttempts: 3,
        
        // Delay between retries (in milliseconds)
        retryDelay: 1000
    },
    
    // Embed colors (hex values)
    colors: {
        stock: 0x4CAF50,      // Green
        weather: 0x2196F3,    // Blue
        restock: 0xFF9800,    // Orange
        watchlist: 0x9C27B0,  // Purple
        error: 0xF44336,      // Red
        success: 0x4CAF50     // Green
    },
    
    // Custom emojis (use Discord emoji IDs or Unicode)
    emojis: {
        stock: '📦',
        weather: '🌤️',
        restock: '⏰',
        watchlist: '👀',
        alert: '🚨',
        success: '✅',
        error: '❌',
        loading: '⏳'
    }
};
