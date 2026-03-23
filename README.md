# Solder Paste Storage Environment Monitoring

Real-time, responsive web dashboard built for L&T ESDM to monitor temperature and humidity of solder paste storage using an ESP32 micro-controller. 

## Features
- **Real-Time Websocket Updates**: 5-minute interval streaming of active conditions gracefully plotting over time.
- **Strict Constraints**: Dynamic UI highlighting of acceptable limits (Temperature: 2°C–10°C, Humidity: 30%–65%).
- **Interactive Graphs**: Auto-scaling Chart.js rendering strictly locked bounding timelines from 1 hour to 1 month with live dotted indicator annotations. 
- **Industrial Dashboard**: Fluid Light/Dark mode transitions, modern aesthetics, gradient-infused layouts, and integrated tabular inventory tracking.
- **SQLite Database**: Headless historic metrics preservation securely resilient against timezone truncation.

## Installation
1. Clone the repository.
2. Run `npm install` to grab core package dependencies (`express`, `ws`, `sqlite3`).
3. Boot the environment using `npm run start`.
4. The dashboard will be accessible via HTTP locally at `http://localhost:3005` or your assigned network IP address.

## Built With
- Node.js & Express
- SQLite3
- HTML5, CSS3, JavaScript
- Chart.js & WebSockets
