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

const ch1Value = byId('ch1-value');
const ch2Value = byId('ch2-value');
const ch3Value = byId('ch3-value');
const ch4Value = byId('ch4-value');

const ch1Bar = byId('ch1-bar');
const ch2Bar = byId('ch2-bar');
const ch3Bar = byId('ch3-bar');
const ch4Bar = byId('ch4-bar');

const clientUNID = crypto.randomUUID();

let chart = null;
let eegBuffer = []; // {timestamp, ch1, ch2, ch3, ch4}
let eegHighestPeak = 0;
let eegLowestTrough = 0;
let deviceInterval;

/**
 * This script handles the simulation chart UI.
 * @returns {void}
 */
async function initChart() {

    await initSimulation();

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
        const value = byId(`ch${index + 1}-value`);
        const bar = byId(`ch${index + 1}-bar`);

        if (label) label.style.color = color;
        if (value) value.style.color = color;
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
 * Starts the device interval
 */
function startDeviceInterval() {
    deviceInterval = setInterval(() => {
        if (!isDeviceConnected || !deviceData) return;

        handleDeviceAddToBuffer(deviceData);

    }, 1000 / eegSimulationConfig.simulation.sampleRate * 4); // ~62.5ms per packet (4 samples simulated)
}

/**
 * Clears the device interval
 */
function clearDeviceInterval() {
    if (deviceInterval) {
        clearInterval(deviceInterval);
    }
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
    const maxVal = eegSimulationConfig.simulation.options.scales.y.suggestedMax;
    const norm = v => Math.min(100, Math.max(5, Math.abs(v) / maxVal * 100));

    ch1Bar.style.width = norm(data.ch1) + '%';
    ch2Bar.style.width = norm(data.ch2) + '%';
    ch3Bar.style.width = norm(data.ch3) + '%';
    ch4Bar.style.width = norm(data.ch4) + '%';

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
    const eegData = { timestamp, ...data };
    eegBuffer.push(eegData);
    sendToHub(eegData);
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
 * Shows a device connection by updating the UI to show connected status and fake device info.
 * In a real application, this would be replaced by actual Bluetooth connection logic using the BrainBit Web SDK.
 * @returns {void}
 */
function showConnection() {

    byId('device-channels').innerHTML = `<span class="px-2 py-0.5 bg-emerald-900/60 text-emerald-400 text-sm font-bold rounded">4CH</span>`;

    setVisibility(connectDeviceBtn, false);
    setVisibility(disconnectDeviceBtn, true);

    byId('device-info').classList.remove('hidden');
}

/**
 * Shows we're connecting
 */
function showConnecting() {
    connectDeviceBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin fa-fw mr-2"></i> Connecting...`;
    connectDeviceBtn.disabled = true;
}

/**
 * Shows we're not connected
 */
function showNotConnected() {
    connectDeviceBtn.innerHTML = `<i class="fa-solid fa-link fa-fw mr-2"></i> <span>Connect</span>`;

    byId('device-name').innerHTML = 'Not connected';
    byId('device-channels').innerHTML = '';

    setVisibility(connectDeviceBtn, true);
    setVisibility(disconnectDeviceBtn, false);

    clearBatteryCharge();
    byId('device-info').classList.add('hidden');
}

/**
 * Handles device connection by updating the UI.
 * @returns {void}
 */
async function connectDevice(event) {
    event.preventDefault();

    const bluetoothSupported = isBluetoothSupported();
    if (!bluetoothSupported) {
        alert(`The current browser does not support the Bluetooth Web API. But you can use EEG simulation instead.`)
    } else {

        showConnecting();

        try {
            await connectToEegDevice(event);

        } catch (e) {
            showNotConnected();
            alert(e.message);
        }
    }
    if (!bluetoothSupported) {

        if (confirm('Press Ok to use EEG simulation instead.')) {
            doSimulation();
        }
    }
}

/**
 * 
 * @returns {boolean} True if Bluetooth is supported by the browser.
 */
function isBluetoothSupported() {
    return navigator.bluetooth ? true : false;
}

/**
 * Handles device disconnection by updating the UI and stopping any ongoing simulations or data processing.
 * In a real application, this would also involve disconnecting from the Bluetooth device and cleaning up resources.
 * @returns {void}
 */
function disconnectDevice() {

    if (isBluetoothSupported() && isDeviceConnected) {
        disconnectFromEegDevice();
    }

    addLogEntry('Disconnected from headband', 'system');
}

/**
 * Eables the user to download current EEG buffer
 */
function downloadEEG() {
    const csvContent = "timestamp,ch1,ch2,ch3,ch4\n" +
        eegBuffer.map(row =>
            `${row.timestamp},${row.ch1},${row.ch2},${row.ch3},${row.ch4}`
        ).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `eeg_recording_${new Date().toISOString()}.csv`;
    link.click();
}