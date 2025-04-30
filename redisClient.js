// redisClient.js
const { createClient } = require('redis');

const client = createClient({
    url: 'redis://default:dssYpBnYQrl01GbCGVhVq2e4dYvUrKJB@redis-12675.c212.ap-south-1-1.ec2.cloud.redislabs.com:12675', // or your Redis server URL
});

client.on('error', (err) => console.error('Redis Client Error', err));

// Connect explicitly before using
(async () => {
    await client.connect();
    console.log("redis is connected")
})();

module.exports = client;
