const fs = require('fs').promises;
const path = require('path');

class DataManager {
    constructor() {
        this.dataDir = path.join(__dirname, 'data');
        this.watchlistFile = path.join(this.dataDir, 'watchlists.json');
        this.monitoringFile = path.join(this.dataDir, 'monitoring-data.json');
        this.backupDir = path.join(this.dataDir, 'backups');
        
        this.ensureDataDirectory();
    }
    
    async ensureDataDirectory() {
        try {
            await fs.mkdir(this.dataDir, { recursive: true });
            await fs.mkdir(this.backupDir, { recursive: true });
            console.log('📁 Data directories initialized');
        } catch (error) {
            console.error('❌ Failed to create data directories:', error);
        }
    }
    
    /**
     * Save user watchlists to file
     * @param {Map} watchlists - Map of userId -> Set of watched items
     */
    async saveWatchlists(watchlists) {
        try {
            // Convert Map of Sets to plain object for JSON serialization
            const data = {
                lastUpdated: new Date().toISOString(),
                version: '1.0',
                watchlists: {}
            };
            
            for (const [userId, itemSet] of watchlists.entries()) {
                data.watchlists[userId] = Array.from(itemSet);
            }
            
            await this.writeFileWithBackup(this.watchlistFile, JSON.stringify(data, null, 2));
            console.log(`💾 Saved watchlists for ${Object.keys(data.watchlists).length} users`);
        } catch (error) {
            console.error('❌ Failed to save watchlists:', error);
        }
    }
    
    /**
     * Load user watchlists from file
     * @returns {Map} Map of userId -> Set of watched items
     */
    async loadWatchlists() {
        try {
            const data = await fs.readFile(this.watchlistFile, 'utf8');
            const parsed = JSON.parse(data);
            
            const watchlists = new Map();
            
            if (parsed.watchlists) {
                for (const [userId, items] of Object.entries(parsed.watchlists)) {
                    watchlists.set(userId, new Set(items));
                }
            }
            
            console.log(`📖 Loaded watchlists for ${watchlists.size} users`);
            return watchlists;
        } catch (error) {
            if (error.code === 'ENOENT') {
                console.log('📝 No existing watchlist file found, starting fresh');
            } else {
                console.error('❌ Failed to load watchlists:', error);
            }
            return new Map();
        }
    }
    
    /**
     * Save monitoring data (previous stock/weather states)
     * @param {Object} monitoringData - Previous API data for comparison
     */
    async saveMonitoringData(monitoringData) {
        try {
            const data = {
                lastUpdated: new Date().toISOString(),
                version: '1.0',
                data: monitoringData
            };
            
            await this.writeFileWithBackup(this.monitoringFile, JSON.stringify(data, null, 2));
            console.log('💾 Saved monitoring data');
        } catch (error) {
            console.error('❌ Failed to save monitoring data:', error);
        }
    }
    
    /**
     * Load monitoring data
     * @returns {Object} Previous monitoring data
     */
    async loadMonitoringData() {
        try {
            const data = await fs.readFile(this.monitoringFile, 'utf8');
            const parsed = JSON.parse(data);
            
            console.log('📖 Loaded previous monitoring data');
            return parsed.data || { stock: null, weather: null };
        } catch (error) {
            if (error.code === 'ENOENT') {
                console.log('📝 No existing monitoring data found, starting fresh');
            } else {
                console.error('❌ Failed to load monitoring data:', error);
            }
            return { stock: null, weather: null };
        }
    }
    
    /**
     * Write file with automatic backup
     * @param {string} filePath - Path to write to
     * @param {string} content - Content to write
     */
    async writeFileWithBackup(filePath, content) {
        // Create backup if file exists
        try {
            await fs.access(filePath);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupPath = path.join(
                this.backupDir, 
                `${path.basename(filePath, '.json')}_${timestamp}.json`
            );
            await fs.copyFile(filePath, backupPath);
        } catch (error) {
            // File doesn't exist, no backup needed
        }
        
        // Write new content
        await fs.writeFile(filePath, content, 'utf8');
    }
    
    /**
     * Clean up old backup files (keep only last 10)
     */
    async cleanupBackups() {
        try {
            const files = await fs.readdir(this.backupDir);
            const backupFiles = files
                .filter(file => file.endsWith('.json'))
                .map(file => ({
                    name: file,
                    path: path.join(this.backupDir, file),
                    time: fs.stat(path.join(this.backupDir, file))
                }));
            
            // Sort by modification time (newest first)
            const sortedFiles = await Promise.all(
                backupFiles.map(async file => ({
                    ...file,
                    time: (await file.time).mtime
                }))
            );
            
            sortedFiles.sort((a, b) => b.time - a.time);
            
            // Keep only the 10 newest backups
            const toDelete = sortedFiles.slice(10);
            
            for (const file of toDelete) {
                await fs.unlink(file.path);
                console.log(`🗑️ Removed old backup: ${file.name}`);
            }
        } catch (error) {
            console.error('❌ Failed to cleanup backups:', error);
        }
    }
    
    /**
     * Export all data for manual backup
     * @returns {Object} All bot data
     */
    async exportAllData() {
        try {
            const watchlists = await this.loadWatchlists();
            const monitoring = await this.loadMonitoringData();
            
            return {
                exportDate: new Date().toISOString(),
                version: '1.0',
                watchlists: Object.fromEntries(
                    Array.from(watchlists.entries()).map(([k, v]) => [k, Array.from(v)])
                ),
                monitoring
            };
        } catch (error) {
            console.error('❌ Failed to export data:', error);
            return null;
        }
    }
    
    /**
     * Import data from export
     * @param {Object} exportData - Data to import
     */
    async importData(exportData) {
        try {
            if (exportData.watchlists) {
                const watchlists = new Map();
                for (const [userId, items] of Object.entries(exportData.watchlists)) {
                    watchlists.set(userId, new Set(items));
                }
                await this.saveWatchlists(watchlists);
            }
            
            if (exportData.monitoring) {
                await this.saveMonitoringData(exportData.monitoring);
            }
            
            console.log('✅ Data import completed');
        } catch (error) {
            console.error('❌ Failed to import data:', error);
        }
    }
    
    /**
     * Get data statistics
     * @returns {Object} Statistics about stored data
     */
    async getStats() {
        try {
            const watchlists = await this.loadWatchlists();
            const totalWatchedItems = Array.from(watchlists.values())
                .reduce((total, set) => total + set.size, 0);
            
            return {
                totalUsers: watchlists.size,
                totalWatchedItems,
                avgItemsPerUser: watchlists.size > 0 ? (totalWatchedItems / watchlists.size).toFixed(1) : 0,
                dataFiles: {
                    watchlists: await this.fileExists(this.watchlistFile),
                    monitoring: await this.fileExists(this.monitoringFile)
                }
            };
        } catch (error) {
            console.error('❌ Failed to get stats:', error);
            return null;
        }
    }
    
    async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }
}

module.exports = DataManager;
