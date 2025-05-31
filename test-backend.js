// Simple script to test if the backend is accessible
// Run with: node test-backend.js

const https = require('https');
const http = require('http');

// List of URLs to test
const urls = [
  'https://web-production-2bf0.up.railway.app/',
  'https://web-production-2bf0.up.railway.app/test',
  'https://web-production-2bf0.up.railway.app/railway-test',
  'https://web-production-2bf0.up.railway.app/api/jobs',
  'https://web-production-2bf0.railway.app/',
  'http://web-production-2bf0.up.railway.app/',
  'http://web-production-2bf0.railway.app/'
];

// Function to make a request to a URL
function testUrl(url) {
  console.log(`Testing URL: ${url}`);
  
  const client = url.startsWith('https') ? https : http;
  
  const req = client.get(url, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        // Try to parse as JSON
        const jsonData = JSON.parse(data);
        console.log('Response (JSON):', jsonData);
      } catch (e) {
        // If not JSON, show first 200 characters
        console.log(`Response (first 200 chars): ${data.substring(0, 200)}...`);
      }
      console.log('-----------------------------------');
    });
  });
  
  req.on('error', (error) => {
    console.error(`Error: ${error.message}`);
    console.log('-----------------------------------');
  });
  
  req.end();
}

// Test each URL with a delay between requests
urls.forEach((url, index) => {
  setTimeout(() => {
    testUrl(url);
  }, index * 2000); // 2 second delay between requests
});

console.log('Testing backend URLs...');
console.log('-----------------------------------');