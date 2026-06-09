"use strict"
/*
Copyright (c) 2026 Ronni Kahalani

X: https://x.com/RonniKahalani
Github: https://github.com/RonniKahalani
Website: https://learningisliving.dk
LinkedIn: https://www.linkedin.com/in/kahalani/

Permission is hereby granted, free of charge, to any person obtaining a copy  
of this software and associated documentation files (the "Software"), to deal  
in the Software without restriction, including without limitation the rights  
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell  
copies of the Software, and to permit persons to whom the Software is  
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all  
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR  
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,  
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE  
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER  
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,  
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE  
SOFTWARE.
*/

const FILE_SIMULATION = './data/config/eeg-simulation.json';

const ch1Value = byId('ch1-value');
const ch2Value = byId('ch2-value');
const ch3Value = byId('ch3-value');
const ch4Value = byId('ch4-value');

const ch1Bar = byId('ch1-bar');
const ch2Bar = byId('ch2-bar');
const ch3Bar = byId('ch3-bar');
const ch4Bar = byId('ch4-bar');

let chart = null;
let eegBuffer = []; // {timestamp, ch1, ch2, ch3, ch4}

let eegSimulationConfig = null;
let simulationInterval = null;
let isConnected = false;

let eegHighestPeak = 0;
let eegLowestTrough = 0;

/**
 * This script handles the simulation chart UI.
 * @returns {void}
 */
async function initChart() {
    eegSimulationConfig = await loadUrlAsObject(FILE_SIMULATION);

    const ctx = byId('eeg-chart');
    const datasets = [];

    const channelColors = [
        eegSimulationConfig.channels.ch1.color,
        eegSimulationConfig.channels.ch2.color,
        eegSimulationConfig.channels.ch3.color,
        eegSimulationConfig.channels.ch4.color
    ];

    channelColors.forEach((color, index) => {
        const label = byId(`ch${index + 1}-label`);
        const bar = byId(`ch${index + 1}-bar`);
        if (label) label.style.color = color;
        if (bar) bar.style.backgroundColor = color;

        datasets.push({
            label: `CH${index + 1}`,
            data: [],
            backgroundColor: color,
            borderColor: color,
            borderWidth: 2,
            tension: 0.3,
            pointRadius: 0,
            fill: false
        });
    });

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: datasets
        },
        options: eegSimulationConfig.simulation.options
    });
}

/**
 * Updates the simulation chart with new data.
 * @param {*} newData 
 * @returns {void}
 */
function updateChart(newData) {
    if (!chart) return;

    const now = Date.now();
    const timeLabel = new Date(now).toLocaleTimeString([], { minute: '2-digit', second: '2-digit' });

    // Add new data point
    const labels = chart.data.labels;
    labels.push(timeLabel);

    const datasets = chart.data.datasets;
    datasets[0].data.push(newData.ch1);
    datasets[1].data.push(newData.ch2);
    datasets[2].data.push(newData.ch3);
    datasets[3].data.push(newData.ch4);

    // Trim old data
    if (labels.length > eegSimulationConfig.simulation.maxChartPoints) {
        labels.shift();
        datasets.forEach(ds => ds.data.shift());
    }

    chart.update('none');
}

/**
 * Updates the live metrics display with new data.
 * @param {*} data 
 * @returns {void}
 */
function updateLiveMetrics(data) {
    // Update numeric values
    ch1Value.textContent = data.ch1.toFixed(1);
    ch2Value.textContent = data.ch2.toFixed(1);
    ch3Value.textContent = data.ch3.toFixed(1);
    ch4Value.textContent = data.ch4.toFixed(1);

    // Update bars (normalized to 0-100%)
    const maxVal = eegSimulationConfig.simulation.options.scales.y.max;
    const norm = v => Math.min(100, Math.max(5, Math.abs(v) / maxVal * 100));

    ch1Bar.style.width = norm(data.ch1) + '%';
    ch2Bar.style.width = norm(data.ch2) + '%';
    ch3Bar.style.width = norm(data.ch3) + '%';
    ch4Bar.style.width = norm(data.ch4) + '%';

    // Color code values
    const colorValue = (val, el) => {
        el.style.color = Math.abs(val) > 50 ? '#f43f5e' : (Math.abs(val) > 25 ? '#f59e0b' : '#64748b');
    };
    colorValue(data.ch1, ch1Value);
    colorValue(data.ch2, ch2Value);
    colorValue(data.ch3, ch3Value);
    colorValue(data.ch4, ch4Value);

    updateStats(data);
}

/**
 * Updates the statistics
 * @param {Object}
 * @returns {void}
 */
function updateStats(data) {
    const eegAvg = byId('eeg-avg');
    if (eegAvg) {
        eegAvg.innerHTML = ((data.ch1 + data.ch2 + data.ch3 + data.ch4) / 4).toFixed(1);
    }

    const eegPeak = byId('eeg-peak');
    if (eegPeak) {
        const maxValue = Math.max(data.ch1, data.ch2, data.ch3, data.ch4);
        if (maxValue > eegHighestPeak) {
            eegHighestPeak = maxValue;
            eegPeak.innerHTML = maxValue.toFixed(1);
        }
    }

    const eegTrough = byId('eeg-trough');
    if (eegTrough) {
        const minValue = Math.min(data.ch1, data.ch2, data.ch3, data.ch4);
        if (minValue < eegLowestTrough) {
            eegLowestTrough = minValue;
            eegTrough.innerHTML = minValue.toFixed(1);
        }
    }
}

/**
 * Adds data to the EEG buffer and updates the chart and metrics. It also checks the pattern conditions. 
 * @param {*} data 
 * @returns {void}
 */
function addToBuffer(data) {
    const timestamp = Date.now();
    eegBuffer.push({ timestamp, ...data });
    trimEegBuffer(timestamp);

    // Update chart and metrics
    updateChart(data);
    updateLiveMetrics(data);

    // Run pattern detection (throttled)
    if (Date.now() - lastDataTime > 180) {
        lastDataTime = Date.now();
        checkAllPatterns(eegBuffer);
    }
}

/**
 * Trim buffer to max buffer seconds
 */
function trimEegBuffer(timestamp) {
    const cutoff = timestamp - (eegSimulationConfig.simulation.maxBufferSeconds * 1000);
    eegBuffer = eegBuffer.filter(d => d.timestamp > cutoff);
}

/**
 * Generates simulated EEG data.
 * @param {Object} config - The EEG simulation configuration object.
 * @returns {Object} Simulated EEG data for each channel.
 */
function generateSimulatedEEG(config) {
    if (!config) throw new Error('EEG simulation config not loaded');

    const t = Date.now() / 1000 * config.simulation.timeScale;

    const noise = () => (Math.random() - 0.5) * config.simulation.noise.amplitude;

    // Channel signals
    const c = config.channels;

    let ch1 = Math.sin(t * c.ch1.lowFrequency) * c.ch1.lowAmplitude +
        Math.sin(t * c.ch1.highFrequency) * c.ch1.highAmplitude + noise();

    let ch2 = Math.sin(t * c.ch2.lowFrequency) * c.ch2.lowAmplitude +
        Math.sin(t * c.ch2.highFrequency) * c.ch2.highAmplitude + noise();

    let ch3 = Math.sin(t * c.ch3.lowFrequency) * c.ch3.lowAmplitude +
        Math.sin(t * c.ch3.highFrequency) * c.ch3.highAmplitude + noise();

    let ch4 = Math.sin(t * c.ch4.lowFrequency) * c.ch4.lowAmplitude +
        Math.sin(t * c.ch4.highFrequency) * c.ch4.highAmplitude + noise();

    // Blink / high-amplitude artifact
    const blink = config.artifacts.blink;
    if (Math.random() < blink.probability) {
        const spike = (Math.random() - 0.5) * blink.amplitude;
        ch1 += spike * blink.channelMultipliers.ch1;
        ch2 += spike * blink.channelMultipliers.ch2;
        ch3 += spike * blink.channelMultipliers.ch3;
        ch4 += spike * blink.channelMultipliers.ch4;
    }

    // Slow drift
    const drift = config.artifacts.drift;
    if (Math.random() < drift.probability) {
        ch1 += (Math.random() - 0.5) * drift.amplitudes.ch1;
        ch4 += (Math.random() - 0.5) * drift.amplitudes.ch4;
    }

    return {
        ch1: parseFloat(ch1.toFixed(1)),
        ch2: parseFloat(ch2.toFixed(1)),
        ch3: parseFloat(ch3.toFixed(1)),
        ch4: parseFloat(ch4.toFixed(1))
    };
}

/**
 * Starts the EEG simulation.
 * @returns {void}
 */
function startSimulation() {
    if (isSimulating) return;

    isSimulating = true;
    byId('sim-text').textContent = 'Stop';
    byId('sim-icon').classList.remove('fa-play');
    byId('sim-icon').classList.add('fa-stop', 'text-red-400');

    // Simulate device connection if not connected
    if (!isConnected) {
        simulateConnection();
    }

    simulationInterval = setInterval(() => {
        if (!isSimulating) return;

        const data = generateSimulatedEEG(eegSimulationConfig);
        addToBuffer(data);

        // Occasionally update "sample rate"
        if (Math.random() < 0.1) {
            const rate = 248 + Math.floor(Math.random() * 5);
            byId('sample-rate').textContent = rate + ' Hz';
        }
    }, 1000 / eegSimulationConfig.simulation.sampleRate * 4); // ~62.5ms per packet (4 samples simulated)

    addLogEntry('Simulation started — generating synthetic EEG data', 'system');
}

/**
 * Stops the EEG simulation.
 * @returns {void}
 */
function stopSimulation() {
    if (!isSimulating) return;

    isSimulating = false;
    clearInterval(simulationInterval);
    simulationInterval = null;

    byId('sim-text').textContent = 'Simulate';
    byId('sim-icon').classList.add('fa-play');
    byId('sim-icon').classList.remove('fa-stop', 'text-red-400');

    addLogEntry('Simulation stopped', 'system');
}

/**
 * Toggles the EEG simulation on or off.
 * @returns {void}
 */
function toggleSimulation() {
    if (isSimulating) {
        stopSimulation();
    } else {
        startSimulation();
    }
}

/**
 * Simulates a device connection by updating the UI to show connected status and fake device info.
 * In a real application, this would be replaced by actual Bluetooth connection logic using the BrainBit Web SDK.
 * @returns {void}
 */
function simulateConnection() {
    isConnected = true;

    const statusEl = byId('connection-status');
    const icon = byId('status-icon');
    const text = byId('status-text');
    const sub = byId('status-subtext');

    statusEl.classList.remove('border-slate-700');
    statusEl.classList.add('border-emerald-500/60', 'bg-emerald-900/20');

    icon.classList.remove('fa-plug', 'text-amber-400');
    icon.classList.add('fa-link', 'text-emerald-400');

    text.textContent = 'Connected';
    text.classList.add('text-emerald-400');
    byId('device-name').textContent = 'BrainBit 2 Pro';
    byId('device-channels').innerHTML = `<span class="px-2 py-0.5 bg-emerald-900/60 text-emerald-400 text-sm font-bold rounded">4CH</span>`;

    byId('connect-btn').classList.add('hidden');
    byId('disconnect-btn').classList.remove('hidden');
    byId('device-info').classList.remove('hidden');

    // Fake device info
    byId('battery-bar').style.width = '82%';
    byId('battery-text').textContent = '82%';
    byId('firmware-text').textContent = '2.4.1';
    byId('device-name').innerHTML = 'BrainBit 2 Pro';
    byId('device-channels').innerHTML = `<span class="px-2 py-0.5 bg-emerald-900/60 text-emerald-400 text-sm font-bold rounded">4CH</span>`;
    addLogEntry('Connected to BrainBit headband (simulated)', 'success');
}

/**
 * Handles device disconnection by updating the UI and stopping any ongoing simulations or data processing.
 * @returns {void}
 */
function connectDevice() {
    const btn = byId('connect-btn');
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin fa-fw mr-2"></i> Connecting...`;
    btn.disabled = true;

    setTimeout(() => {
        // In real app: await brainbitClient.connect()
        simulateConnection();
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-link fa-fw mr-2"></i> <span>Connect</span>`;
        btn.classList.add('hidden');

        // Auto-start simulation if not already
        if (!isSimulating) {
            startSimulation();
        }
    }, 850);
}

/**
 * Handles device disconnection by updating the UI and stopping any ongoing simulations or data processing.
 * In a real application, this would also involve disconnecting from the Bluetooth device and cleaning up resources.
 * @returns {void}
 */
function disconnectDevice() {
    isConnected = false;
    stopSimulation();

    const statusEl = byId('connection-status');
    const icon = byId('status-icon');
    const text = byId('status-text');

    statusEl.classList.remove('border-emerald-500/60', 'bg-emerald-900/20');
    statusEl.classList.add('border-slate-700');

    icon.classList.remove('fa-link', 'text-emerald-400');
    icon.classList.add('fa-plug', 'text-amber-400');

    text.textContent = 'Disconnected';
    text.classList.remove('text-emerald-400');
    byId('device-name').innerHTML = 'Not connected';
    byId('device-channels').innerHTML = '';
    byId('connect-btn').classList.remove('hidden');
    byId('disconnect-btn').classList.add('hidden');
    byId('device-info').classList.add('hidden');

    addLogEntry('Disconnected from headband', 'system');
}
