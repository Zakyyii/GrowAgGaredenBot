const fs = require('fs').promises;
const path = require('path');
const DataManager = require('./data-manager');

class DataRecovery {
    constructor() {
        this.dataManager = new DataManager();
    }
    
    async showMenu() {
        console.log('\n🛠️  Garden Bot Data Recovery Tool');
        console.log('==================================');
        console.log('1. Show data statistics');
        console.log('2. Export all data');
        console.log('3. Import data from file');
        console.log('4. List backup files');
        console.log('5. Restore from backup');
        console.log('6. Cleanup old backups');
        console.log('7. Validate data integrity');
        console.log('0. Exit');
        console.log('');
        
        process.stdout.write('Choose an option (0-7): ');
    }
    
    async handleInput(choice) {
        switch (choice.trim()) {
            case '1':
                await this.showStats();
                break;
            case '2':
                await this.exportData();
                break;
            case '3':
                await this.importData();
                break;
            case '4':
                await this.listBackups();
                break;
            case '5':
                await this.restoreFromBackup();
                break;
            case '6':
                await this.cleanupBackups();
                break;
            case '7':
                await this.validateData();
                break;
            case '0':
                console.log('👋 Goodbye!');
                process.exit(0);
                break;
            default:
                console.log('❌ Invalid choice. Please try again.');
        }
    }
    
    async showStats() {
        try {
            const stats = await this.dataManager.getStats();
            if (stats) {
                console.log('\n📊 Data Statistics:');
                console.log(`👥 Total users: ${stats.totalUsers}`);
                console.log(`👀 Total watched items: ${stats.totalWatchedItems}`);
                console.log(`📈 Average items per user: ${stats.avgItemsPerUser}`);
                console.log(`💾 Watchlist file exists: ${stats.dataFiles.watchlists ? 'Yes' : 'No'}`);
                console.log(`💾 Monitoring file exists: ${stats.dataFiles.monitoring ? 'Yes' : 'No'}`);
            } else {
                console.log('❌ Failed to get statistics');
            }
        } catch (error) {
            console.log('❌ Error getting stats:', error.message);
        }
    }
    
    async exportData() {
        try {
            const data = await this.dataManager.exportAllData();
            if (data) {
                const filename = `garden-bot-export-${new Date().toISOString().split('T')[0]}.json`;
                await fs.writeFile(filename, JSON.stringify(data, null, 2));
                console.log(`✅ Data exported to: ${filename}`);
            } else {
                console.log('❌ Failed to export data');
            }
        } catch (error) {
            console.log('❌ Error exporting data:', error.message);
        }
    }
    
    async importData() {
        try {
            process.stdout.write('Enter filename to import: ');
            const filename = await this.getInput();
            
            const data = JSON.parse(await fs.readFile(filename.trim(), 'utf8'));
            await this.dataManager.importData(data);
            console.log('✅ Data imported successfully');
        } catch (error) {
            console.log('❌ Error importing data:', error.message);
        }
    }
    
    async listBackups() {
        try {
            const backupDir = path.join(__dirname, 'data', 'backups');
            const files = await fs.readdir(backupDir);
            const backupFiles = files.filter(file => file.endsWith('.json'));
            
            if (backupFiles.length === 0) {
                console.log('📁 No backup files found');
                return;
            }
            
            console.log('\n📁 Available backups:');
            for (let i = 0; i < backupFiles.length; i++) {
                const file = backupFiles[i];
                const filePath = path.join(backupDir, file);
                const stats = await fs.stat(filePath);
                console.log(`${i + 1}. ${file} (${stats.mtime.toLocaleString()})`);
            }
        } catch (error) {
            console.log('❌ Error listing backups:', error.message);
        }
    }
    
    async restoreFromBackup() {
        await this.listBackups();
        process.stdout.write('\nEnter backup filename to restore: ');
        const filename = await this.getInput();
        
        try {
            const backupDir = path.join(__dirname, 'data', 'backups');
            const backupPath = path.join(backupDir, filename.trim());
            
            const data = JSON.parse(await fs.readFile(backupPath, 'utf8'));
            
            // Parse backup data format
            if (data.watchlists) {
                await this.dataManager.importData({ watchlists: data.watchlists });
            } else if (data.data) {
                await this.dataManager.saveMonitoringData(data.data);
            }
            
            console.log('✅ Backup restored successfully');
        } catch (error) {
            console.log('❌ Error restoring backup:', error.message);
        }
    }
    
    async cleanupBackups() {
        try {
            await this.dataManager.cleanupBackups();
            console.log('✅ Backup cleanup completed');
        } catch (error) {
            console.log('❌ Error cleaning backups:', error.message);
        }
    }
    
    async validateData() {
        try {
            console.log('🔍 Validating data integrity...');
            
            // Check watchlists
            const watchlists = await this.dataManager.loadWatchlists();
            let totalItems = 0;
            let validUsers = 0;
            
            for (const [userId, items] of watchlists.entries()) {
                if (typeof userId === 'string' && items instanceof Set) {
                    validUsers++;
                    totalItems += items.size;
                } else {
                    console.log(`⚠️ Invalid watchlist data for user: ${userId}`);
                }
            }
            
            // Check monitoring data
            const monitoring = await this.dataManager.loadMonitoringData();
            const hasValidMonitoring = monitoring && typeof monitoring === 'object';
            
            console.log(`✅ Validation complete:`);
            console.log(`   👥 Valid users: ${validUsers}`);
            console.log(`   👀 Total items: ${totalItems}`);
            console.log(`   📊 Monitoring data: ${hasValidMonitoring ? 'Valid' : 'Invalid'}`);
            
        } catch (error) {
            console.log('❌ Error validating data:', error.message);
        }
    }
    
    getInput() {
        return new Promise((resolve) => {
            process.stdin.once('data', (data) => {
                resolve(data.toString());
            });
        });
    }
    
    async run() {
        console.log('🌱 Welcome to Garden Bot Data Recovery Tool');
        
        process.stdin.setRawMode(false);
        process.stdin.setEncoding('utf8');
        
        while (true) {
            await this.showMenu();
            const input = await this.getInput();
            await this.handleInput(input);
            console.log('');
        }
    }
}

// Run if called directly
if (require.main === module) {
    const recovery = new DataRecovery();
    recovery.run().catch(console.error);
}

module.exports = DataRecovery;
