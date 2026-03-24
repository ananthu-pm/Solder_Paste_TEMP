const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const cors = require('cors');
const { insertReading, getHistory } = require('./database');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Added to support standard ESP32 POST payloads

// REST API for Historical Data
app.get('/api/history', async (req, res) => {
    const hours = req.query.hours || 12;
    try {
        const data = await getHistory(hours);
        res.json(data);
    } catch (err) {
        console.error('Error fetching history:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// HTTP endpoint for ESP32 fallback
app.post('/api/data', async (req, res) => {
    console.log("Received POST data:", req.body);
    
    // Support various common keys an ESP32 might send
    let body = req.body || {};
    let rawTemp = body.temperature ?? body.temp ?? body.Temperature ?? body.t;
    let rawHum = body.humidity ?? body.hum ?? body.Humidity ?? body.h;

    // Convert to numbers just in case they arrived as form-data strings
    const tempNum = parseFloat(rawTemp);
    const humNum = parseFloat(rawHum);

    if (!isNaN(tempNum) && !isNaN(humNum)) {
        try {
            await insertReading(tempNum, humNum);
            const dataPoint = { timestamp: new Date().toISOString(), temperature: tempNum, humidity: humNum };
            broadcast(JSON.stringify(dataPoint));
            res.status(200).json({ success: true });
        } catch (err) {
            console.error('Error saving data:', err);
            res.status(500).json({ error: 'Database error' });
        }
    } else {
        console.warn("Invalid or missing measurements:", req.body);
        res.status(400).json({ error: 'Missing or invalid measurements' });
    }
});

// WebSocket Server for Real-Time Streaming
wss.on('connection', (ws) => {
    console.log('Client connected');
    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            // Expected from ESP32: { temperature: 25.4, humidity: 45.2 }
            if (data.temperature !== undefined && data.humidity !== undefined) {
                await insertReading(data.temperature, data.humidity);
                const dataPoint = { timestamp: new Date().toISOString(), ...data };
                broadcast(JSON.stringify(dataPoint));
            }
        } catch (err) {
             console.error('WebSocket receive error:', err);
        }
    });

    ws.on('close', () => console.log('Client disconnected'));
});

function broadcast(message) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
