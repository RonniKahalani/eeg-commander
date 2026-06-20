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
 * This script handles connection to the BrainBit EEG device.
 */

const brainbitClient = new BrainbitClient();

let deviceStatusData = [];
let deviceResistanceData = [];
let deviceEventMarkers = [];
let deviceInfo;
let deviceStatus;
let isDeviceConnected = false;
let deviceData;
let deviceInterval;

/**
 * Disconnects the BrainBit client
 */
async function disconnectFromEegDevice() {

    clearDeviceInterval();
    const status = await brainbitClient.connectionStatus;

    if (brainbitClient && isDeviceConnected) {
        isDeviceConnected = false;

        try {
            await brainbitClient.stopEEGStream().catch(() => { });
            await brainbitClient.stopResistanceData().catch(() => { });
            await brainbitClient.disconnect();

            onDeviceDisconnected(deviceInfo);

        } catch (error) {

            if (error.message.includes("GATT Server is disconnected")) {
                console.log("Device already disconnected or in cleanup phase.");
            } else {
                console.error("Disconnect error:", error);
            }
        }
    }
}

/**
 * Shows a Bluetooth connect dialog and connects to an EEG device via the BrainBit client
 */
async function connectToEegDevice() {

    onDeviceConnecting(null);
    await brainbitClient.connect();

    isDeviceConnected = true;
    deviceInfo = await brainbitClient.deviceInfo();
    onDeviceConnected(deviceInfo);

    brainbitClient.eegStream.subscribe((data) => {
        deviceData = data;
    });

    brainbitClient.connectionStatus.subscribe((isConnected) => {
        isDeviceConnected = isConnected;
    });

    brainbitClient.statusData.subscribe((data) => {
        handleDeviceStatusData(data);
    });

    brainbitClient.eventMarkers.subscribe((event) => {
        handleDeviceEventMakers(event);
    });

    brainbitClient.resistanceData.subscribe((data) => {
        handleDeviceResistanceData(data);
    });

    await brainbitClient.startEEGStream();
    //await brainbitClient.startResistanceData();

    startDeviceInterval();
}

/**
 * Handles the device resistance data
 * @param {*} event 
 */
function handleDeviceResistanceData(data) {
    //deviceResistanceData.push(data);
    console.log('resistanceData', data);
}

/**
 * Handles the device event maker data
 * @param {*} event 
 */
function handleDeviceEventMakers(event) {
    deviceEventMarkers.push(event);
    console.log('eventMarkers', event);
}
/**
 * Handles the device status data
 * @param {*} data 
 */
function handleDeviceStatusData(data) {
    deviceStatus = data;
    updateBatteryCharge();
}

/**
 * Clears the battery charge elements
 */
function clearBatteryCharge() {
    const batteryChargeValue = '0%';
    batteryBarElem.style.width = batteryChargeValue;
    batteryTextElem.innerHTML = batteryChargeValue;
}

/**
 * Sets the battery charge elements
 */
function updateBatteryCharge() {
    const batteryChargeValue = deviceStatus.batteryCharge + '%';
    batteryBarElem.style.width = batteryChargeValue;
    batteryTextElem.innerHTML = batteryChargeValue;

}

/**
 * Handles adding new device EEG data to the buffer
 * @param {*} data 
 */
function handleDeviceAddToBuffer(data) {
    if (!config.eeg.ignoreNextSample) {
        if (!config.eeg.averageNextSample) { addToBufferAverage(data); }
        else { addToBufferBoth(data); }
    } else { addToBufferSingle(data); }
}

/**
 * Only adds the current channel
 * @param {*} data 
 */
function addToBufferSingle(data) {

    const multiplier = parseInt(config.eeg.valueMultiplier);

    addToBuffer({
        ch1: data.val0_ch1 * multiplier,
        ch2: data.val0_ch2 * multiplier,
        ch3: data.val0_ch3 * multiplier,
        ch4: data.val0_ch4 * multiplier
    });
}

/**
 * Adds both the current and the next sample as seperate entries
 * @param {*} data 
 */
function addToBufferBoth(data) {

    const multiplier = parseInt(config.eeg.valueMultiplier);

    addToBuffer({
        ch1: data.val0_ch1 * multiplier,
        ch2: data.val0_ch2 * multiplier,
        ch3: data.val0_ch3 * multiplier,
        ch4: data.val0_ch4 * multiplier
    });

    addToBuffer({
        ch1: data.val1_ch1 * multiplier,
        ch2: data.val1_ch2 * multiplier,
        ch3: data.val1_ch3 * multiplier,
        ch4: data.val1_ch4 * multiplier
    });
}

/**
 * Adds the average two samples
 * @param {*} data 
 */
function addToBufferAverage(data) {

    const multiplier = parseInt(config.eeg.valueMultiplier);

    addToBuffer({
        ch1: (data.val0_ch1 + data.val1_ch1) / 2 * multiplier,
        ch2: (data.val0_ch2 + data.val1_ch2) / 2 * multiplier,
        ch3: (data.val0_ch3 + data.val1_ch3) / 2 * multiplier,
        ch4: (data.val0_ch4 + data.val1_ch4) / 2 * multiplier
    });
}

/**
 * Starts the device interval
 */
function startDeviceInterval() {
    deviceInterval = setInterval(() => {
        if (!isDeviceConnected || !deviceData) return;
        handleDeviceAddToBuffer(deviceData);
    }, getDeviceIntervalDelay());
}

/**
 * Returns the delay for device intervals
 * @returns {number} The delay in millis
 */
function getDeviceIntervalDelay() {
    return 1000 / eegSimulationConfig.simulation.sampleRate * 4; // ~62.5ms per packet (4 samples simulated)
}

/**
 * Clears the device interval
 */
function clearDeviceInterval() {
    if (deviceInterval) {
        clearInterval(deviceInterval);
    }
}
