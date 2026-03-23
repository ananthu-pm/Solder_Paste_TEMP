const WebSocket = require('ws');

const WS_URL = 'ws://localhost:3005';

function connectAndSend() {
    console.log('Connecting to', WS_URL, '...');
    const ws = new WebSocket(WS_URL);

    let targetTemp = 5.0; // Valid range 2 to 10
    let targetHum = 45.0; // Valid range 30 to 65
    let intervalId;

    ws.on('open', () => {
        console.log('Mock ESP32 connected. Sending data every 2-5 seconds...');
        
        const sendData = () => {
            // Generate some random fluctuation
            targetTemp += (Math.random() - 0.5) * 1.5;
            targetHum += (Math.random() - 0.5) * 3.0;

            let temp = targetTemp;
            let hum = targetHum;

            // Occasionally create out-of-range values to test UI (5% chance)
            if (Math.random() > 0.95) {
                temp = Math.random() > 0.5 ? 12.0 : 1.0; // out of range
            }
            if (Math.random() > 0.95) {
                hum = Math.random() > 0.5 ? 70.0 : 25.0; // out of range
            }

            temp = Math.max(-5, Math.min(20, temp)); // clamp to realistic bounds
            hum = Math.max(10, Math.min(90, hum));

            const data = {
                temperature: parseFloat(temp.toFixed(2)),
                humidity: parseFloat(hum.toFixed(2))
            };

            ws.send(JSON.stringify(data));
            console.log('Sent:', data);

            // Schedule next send between 2 and 5 seconds
            intervalId = setTimeout(sendData, Math.floor(Math.random() * 3000) + 2000);
        };

        sendData();
    });

    ws.on('error', (err) => {
        console.error('WebSocket Error:', err.message);
    });

    ws.on('close', () => {
        if (intervalId) clearTimeout(intervalId);
        console.log('Disconnected. Retrying in 5 seconds...');
        setTimeout(connectAndSend, 5000);
    });
}

connectAndSend();
