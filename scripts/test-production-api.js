const https = require('https');
const http = require('http');

const PRODUCTION_API = 'https://cemse-back-production-56da.up.railway.app/api';

async function testAPI(url) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https:') ? https : http;

        const req = protocol.get(url, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({
                        success: true,
                        status: res.statusCode,
                        data: jsonData,
                        headers: res.headers
                    });
                } catch (error) {
                    resolve({
                        success: true,
                        status: res.statusCode,
                        data: data,
                        headers: res.headers,
                        note: 'Response is not JSON'
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject({
                success: false,
                error: error.message
            });
        });

        req.setTimeout(10000, () => {
            req.destroy();
            reject({
                success: false,
                error: 'Request timeout (10 seconds)'
            });
        });
    });
}

async function runTests() {
    console.log('🔍 Testing Production API Connection...\n');

    const endpoints = [
        '/health',
        '/auth/me',
        '/municipality',
        '/company',
        '/joboffer'
    ];

    for (const endpoint of endpoints) {
        const fullUrl = `${PRODUCTION_API}${endpoint}`;
        console.log(`Testing: ${fullUrl}`);

        try {
            const result = await testAPI(fullUrl);
            if (result.success) {
                console.log(`✅ Success (${result.status}): ${endpoint}`);
                if (result.data && typeof result.data === 'object') {
                    console.log(`   Response keys: ${Object.keys(result.data).join(', ')}`);
                }
            } else {
                console.log(`❌ Failed: ${endpoint} - ${result.error}`);
            }
        } catch (error) {
            console.log(`❌ Error: ${endpoint} - ${error.error || error.message}`);
        }

        console.log(''); // Empty line for readability
    }

    console.log('🏁 Test completed!');
}

// Run the tests
runTests().catch(console.error);


