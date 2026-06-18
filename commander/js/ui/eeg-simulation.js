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

/**
 * Handles EEG simulation features
 */
const FILE_SIMULATION = './data/config/eeg-simulation.json';

let eegSimulationConfig = null;
let simulationInterval = null;
let isSimulating = false;

function changeYScale(value) {
    chart.options.scales.y.suggestedMin = -value;
    chart.options.scales.y.suggestedMax = value;
    chart.options.scales.y.min = -value;
    chart.options.scales.y.max = value;
    chart.options.scales.y.ticks.stepSize = Math.max(10, Math.floor(value / 10));
    chart.update('none');
}

/**
 * Initializes the EEG simulator
 */
async function initSimulation() {
    eegSimulationConfig = await loadUrlAsObject(FILE_SIMULATION);
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
    simTextElem.textContent = 'Stop';
    simIconElem.classList.remove('fa-play');
    simIconElem.classList.add('fa-stop', 'text-red-400');

    if (isDeviceConnected) {
        if (confirm("A Bluetooth device is connected.\n\nPress Ok to disconnect from device and use simulation.")) {
            disconnectDevice();
        }
    }

    simulationInterval = setInterval(() => {
        if (!isSimulating) return;

        const data = generateSimulatedEEG(eegSimulationConfig);
        addToBuffer(data);

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

    simTextElem.textContent = 'Simulate';
    simIconElem.classList.add('fa-play');
    simIconElem.classList.remove('fa-stop', 'text-red-400');

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
 * Prepares for a simulation
 */
function doSimulation() {

    setTimeout(() => {

        showConnection();
        connectDeviceBtn.disabled = false;
        connectDeviceBtn.innerHTML = `<i class="fa-solid fa-link fa-fw mr-2"></i> <span>Connect</span>`;
        connectDeviceBtn.classList.add('hidden');

        // Auto-start simulation if not already
        if (!isSimulating) {
            startSimulation();
        }
    }, 850);
}
