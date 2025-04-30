require('dotenv').config();
const express = require('express');
const mqtt = require('mqtt');
const redisClient = require('./redisClient');
const connectDb = require('./db')
const cors = require('cors');
const mongoose = require('mongoose')

const app = express();
app.use(cors());
app.use(express.json());

const TaskSchema = new mongoose.Schema({
    items: [String],
    createdAt: { type: Date, default: Date.now }
});

const Task = mongoose.model('Assignment_Himanshu', TaskSchema);

connectDb();



// MQTT setup
const mqttClient = mqtt.connect(process.env.MQTT_BROKER || 'mqtt://127.0.0.1:1883',{
    
        connectTimeout: 10000, // Timeout for connection in ms
        reconnectPeriod: 1000, // Time between reconnect attempts in ms
      
});


mqttClient.on('connect', () => {
    console.log('Connected to MQTT broker',mqttClient.options.port);
    mqttClient.subscribe('/add');
});

mqttClient.on('message', async (topic, message) => {
    if (topic === '/add') {
        try {
            const newItem = message.toString();
            const key = `FULLSTACK_TASK_${process.env.FIRST_NAME || 'USER'}`;
            
            // Get current items from Redis
            const currentItems = await redisClient.get(key);
            let items = currentItems ? JSON.parse(currentItems) : [];
            
            // Add new item
            items.push(newItem);
            
            // Check if we need to move to MongoDB
            if (items.length > 2) {
                // Save to MongoDB
                await Task.create({ items });
                // Clear Redis
                await redisClient.del(key);
            } else {
                // Update Redis
                await redisClient.set(key, JSON.stringify(items));
            }
        } catch (error) {
            console.error('Error processing MQTT message:', error);
        }
    }
});

// HTTP endpoint to fetch all tasks
app.get('/fetchAllTasks', async (req, res) => {
    try {
        
        const key = `FULLSTACK_TASK_${process.env.FIRST_NAME || 'USER'}`;
        
        // Get items from Redis
        const redisItems = await redisClient.get(key);
        const itemsFromRedis = redisItems ? JSON.parse(redisItems) : [];
        
        // Get items from MongoDB
        const itemsFromMongo = await Task.find().sort({ createdAt: -1 });
        
        // Combine and send response
        const allItems = [
            ...itemsFromRedis,
            ...itemsFromMongo.flatMap(task => task.items)
        ];
        
        res.json({ items: allItems });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 