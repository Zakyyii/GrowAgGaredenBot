const fs = require('fs');
const path = require('path');

console.log('🌱 Garden Discord Bot Setup');
console.log('========================');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
    console.log('📝 Creating .env file...');
    fs.copyFileSync('.env.example', '.env');
    console.log('✅ .env file created from template');
    console.log('');
    console.log('⚠️  IMPORTANT: You need to edit the .env file with your Discord bot token!');
    console.log('');
    console.log('Steps to get your Discord bot token:');
    console.log('1. Go to https://discord.com/developers/applications');
    console.log('2. Create a new application');
    console.log('3. Go to the "Bot" section');
    console.log('4. Create a bot and copy the token');
    console.log('5. Paste the token in your .env file');
    console.log('');
    console.log('After setting up your token, run: npm start');
} else {
    console.log('✅ .env file already exists');
    
    // Check if token is configured
    const envContent = fs.readFileSync(envPath, 'utf8');
    if (envContent.includes('your_discord_bot_token_here')) {
        console.log('⚠️  Please configure your Discord bot token in the .env file');
    } else {
        console.log('✅ Discord bot token is configured');
        console.log('🚀 Ready to start! Run: npm start');
    }
}
