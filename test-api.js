const axios = require('axios');

// Test script to verify Garden API endpoints
async function testAPIs() {
    console.log('🧪 Testing Garden API endpoints...\n');
    
    const endpoints = {
        'Stock Data': 'https://growagardenapi.vercel.app/api/stock/GetStock',
        'Weather Info': 'https://growagardenapi.vercel.app/api/GetWeather',
        'Item Info': 'https://growagardenapi.vercel.app/api/Item-Info',
        'Restock Times': 'https://growagardenapi.vercel.app/api/stock/Restock-Time'
    };
    
    for (const [name, url] of Object.entries(endpoints)) {
        try {
            console.log(`Testing ${name}...`);
            const response = await axios.get(url, { timeout: 10000 });
            
            if (response.status === 200) {
                console.log(`✅ ${name}: OK`);
                
                // Show some sample data
                if (name === 'Stock Data' && response.data.seedsStock) {
                    console.log(`   📊 Seeds in stock: ${response.data.seedsStock.length}`);
                } else if (name === 'Weather Info' && response.data.weather) {
                    const active = response.data.weather.filter(w => w.active).length;
                    console.log(`   🌤️ Active weather events: ${active}`);
                } else if (name === 'Item Info' && Array.isArray(response.data)) {
                    console.log(`   📋 Total items: ${response.data.length}`);
                } else if (name === 'Restock Times' && response.data.seeds) {
                    console.log(`   ⏰ Next seed restock: ${response.data.seeds.countdown}`);
                }
            } else {
                console.log(`⚠️ ${name}: Status ${response.status}`);
            }
        } catch (error) {
            console.log(`❌ ${name}: Failed`);
            console.log(`   Error: ${error.message}`);
        }
        console.log('');
    }
    
    console.log('🏁 API testing complete!');
}

// Run the tests
testAPIs().catch(console.error);
