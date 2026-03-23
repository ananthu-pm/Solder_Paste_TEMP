const body = document.body;
const themeBtn = document.getElementById('theme-btn');
const timeBtns = document.querySelectorAll('.filter-btn');
const statusDot = document.getElementById('connection-status');
const statusText = document.getElementById('status-text');
const dateDiv = document.getElementById('datetime');

const currentTempEl = document.getElementById('current-temp');
const currentHumEl = document.getElementById('current-hum');
const tempAlert = document.getElementById('temp-alert');
const humAlert = document.getElementById('hum-alert');

// Thresholds
const TEMP_MIN = 2;
const TEMP_MAX = 10;
const HUM_MIN = 30;
const HUM_MAX = 65;

// Variables to store dynamic colors
let colorGreen, colorRed, textPrimary, borderLine;

function updateColors() {
    colorGreen = getComputedStyle(body).getPropertyValue('--color-green').trim();
    colorRed = getComputedStyle(body).getPropertyValue('--color-red').trim();
    textPrimary = getComputedStyle(body).getPropertyValue('--text-primary').trim();
    borderLine = getComputedStyle(body).getPropertyValue('--border-color').trim();
}
updateColors();

// Theme toggle
let isLight = true;
themeBtn.addEventListener('click', () => {
    isLight = !isLight;
    if (isLight) {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
        themeBtn.textContent = '🌙';
        themeBtn.title = 'Toggle Dark Theme';
    } else {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
        themeBtn.textContent = '☀️';
        themeBtn.title = 'Toggle Light Theme';
    }
    
    updateColors();
    
    Chart.defaults.color = textPrimary;
    Chart.defaults.scale.grid.color = borderLine;
    
    // We update scale grid lines explicitly on instances
    tempChart.options.scales.x.grid.color = borderLine;
    tempChart.options.scales.y.grid.color = borderLine;
    humChart.options.scales.x.grid.color = borderLine;
    humChart.options.scales.y.grid.color = borderLine;
    
    tempChart.update();
    humChart.update();
});

// Clock
setInterval(() => {
    const now = new Date();
    dateDiv.textContent = now.toLocaleString();
}, 1000);
dateDiv.textContent = new Date().toLocaleString();

// Chart setup
Chart.defaults.color = textPrimary;
Chart.defaults.font.family = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";

const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
                label: function(context) {
                    let label = context.dataset.label || '';
                    if (label) label += ': ';
                    if (context.parsed.y !== null) label += context.parsed.y.toFixed(2);
                    return label;
                }
            }
        }
    },
    scales: {
        x: {
            type: 'time',
            time: { tooltipFormat: 'll HH:mm:ss' },
            grid: { display: false },
            ticks: { maxRotation: 0, autoSkipPadding: 20 }
        },
        y: {
            grid: { display: false }
        }
    }
};

const tempCtx = document.getElementById('tempChart').getContext('2d');
const tempChart = new Chart(tempCtx, {
    type: 'line',
    data: { 
        datasets: [{ 
            label: 'Temperature °C', 
            data: [], 
            borderWidth: 3, 
            borderColor: colorGreen,
            pointRadius: 0, 
            pointHoverRadius: 0,
            pointBackgroundColor: ctx => {
                const val = ctx.raw?.y;
                if (val === undefined) return '#fff';
                return (val >= TEMP_MIN && val <= TEMP_MAX) ? colorGreen : colorRed;
            },
            pointBorderColor: '#fff',
            tension: 0,
            spanGaps: true
        }] 
    },
    options: {
        ...commonOptions,
        scales: { ...commonOptions.scales, y: { ...commonOptions.scales.y, title: {display: true, text: 'Temperature (°C)'} } },
        plugins: {
            ...commonOptions.plugins,
            annotation: {
                annotations: {
                    upperLimit: { type: 'line', yMin: TEMP_MAX, yMax: TEMP_MAX, borderColor: 'rgba(255, 61, 0, 0.7)', borderWidth: 2, borderDash: [5, 5] },
                    lowerLimit: { type: 'line', yMin: TEMP_MIN, yMax: TEMP_MIN, borderColor: 'rgba(255, 61, 0, 0.7)', borderWidth: 2, borderDash: [5, 5] }
                }
            }
        },
        elements: {
            line: {
                segment: {
                    borderColor: ctx => {
                        if (!ctx.p0.parsed || !ctx.p1.parsed) return colorGreen;
                        const val = ctx.p1.parsed.y;
                        return (val >= TEMP_MIN && val <= TEMP_MAX) ? colorGreen : colorRed;
                    }
                }
            }
        }
    }
});

const humCtx = document.getElementById('humChart').getContext('2d');
const humChart = new Chart(humCtx, {
    type: 'line',
    data: { 
        datasets: [{ 
            label: 'Humidity %', 
            data: [], 
            borderWidth: 3, 
            borderColor: colorGreen,
            pointRadius: 0, 
            pointHoverRadius: 0,
            pointBackgroundColor: ctx => {
                const val = ctx.raw?.y;
                if (val === undefined) return '#fff';
                return (val >= HUM_MIN && val <= HUM_MAX) ? colorGreen : colorRed;
            },
            pointBorderColor: '#fff',
            tension: 0,
            spanGaps: true
        }] 
    },
    options: {
        ...commonOptions,
        scales: { ...commonOptions.scales, y: { ...commonOptions.scales.y, title: {display: true, text: 'Humidity (%)'} } },
        plugins: {
            ...commonOptions.plugins,
            annotation: {
                annotations: {
                    upperLimit: { type: 'line', yMin: HUM_MAX, yMax: HUM_MAX, borderColor: 'rgba(255, 61, 0, 0.7)', borderWidth: 2, borderDash: [5, 5] },
                    lowerLimit: { type: 'line', yMin: HUM_MIN, yMax: HUM_MIN, borderColor: 'rgba(255, 61, 0, 0.7)', borderWidth: 2, borderDash: [5, 5] }
                }
            }
        },
        elements: {
            line: {
                segment: {
                    borderColor: ctx => {
                        if (!ctx.p0.parsed || !ctx.p1.parsed) return colorGreen;
                        const val = ctx.p1.parsed.y;
                        return (val >= HUM_MIN && val <= HUM_MAX) ? colorGreen : colorRed;
                    }
                }
            }
        }
    }
});

let currentHoursFilter = 24;

function checkThresholds(temp, hum) {
    currentTempEl.textContent = temp.toFixed(1);
    currentHumEl.textContent = hum.toFixed(1);

    if (temp < TEMP_MIN || temp > TEMP_MAX) {
        currentTempEl.style.color = colorRed;
        tempAlert.style.display = 'block';
    } else {
        currentTempEl.style.color = colorGreen;
        tempAlert.style.display = 'none';
    }

    if (hum < HUM_MIN || hum > HUM_MAX) {
        currentHumEl.style.color = colorRed;
        humAlert.style.display = 'block';
    } else {
        currentHumEl.style.color = colorGreen;
        humAlert.style.display = 'none';
    }
}

function processHistoryData(data) {
    const tempData = [];
    const humData = [];
    let lastTemp, lastHum;

    data.forEach(row => {
        const time = new Date(row.timestamp).getTime();
        // Discard anomalies potentially or keep raw, keeping raw for chart
        tempData.push({ x: time, y: row.temperature });
        humData.push({ x: time, y: row.humidity });
        lastTemp = row.temperature;
        lastHum = row.humidity;
    });

    tempChart.data.datasets[0].data = tempData;
    humChart.data.datasets[0].data = humData;

    tempChart.update();
    humChart.update();

    if (lastTemp !== undefined && lastHum !== undefined) {
        checkThresholds(lastTemp, lastHum);
    }
}

async function fetchHistory(hours) {
    try {
        const res = await fetch(`/api/history?hours=${hours}`);
        const data = await res.json();
        processHistoryData(data);
    } catch (err) {
        console.error('Failed to fetch history:', err);
    }
}

// WS Connection
let ws;
let reconnectTimer;

function connectWS() {
    ws = new WebSocket(`ws://${window.location.host}`);
    
    ws.onopen = () => {
        console.log("WebSocket connected.");
        statusText.textContent = 'Connected (Live)';
        statusDot.classList.remove('disconnected');
        statusDot.classList.add('connected');
        if (reconnectTimer) clearTimeout(reconnectTimer);
    };

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            const time = new Date(data.timestamp).getTime();
            
            // Append data incrementally
            tempChart.data.datasets[0].data.push({ x: time, y: data.temperature });
            humChart.data.datasets[0].data.push({ x: time, y: data.humidity });
            
            // Data shifting logic removed to allow all processed data to remain visibly plotted continuously in the current session.

            tempChart.update();
            humChart.update();

            checkThresholds(data.temperature, data.humidity);
        } catch(e) {
            console.error("Error parsing WS message:", e);
        }
    };

    ws.onclose = () => {
        statusText.textContent = 'Disconnected - Retrying...';
        statusDot.classList.remove('connected');
        statusDot.classList.add('disconnected');
        reconnectTimer = setTimeout(connectWS, 3000);
    };
    
    ws.onerror = () => ws.close();
}

// Init
fetchHistory(currentHoursFilter).then(connectWS);

// Time filter buttons removed, defaults to 24 hours
