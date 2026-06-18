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

const deviceInfoElem = byId('device-info');
const deviceNameElem = byId('device-name');
const deviceChannelsElem = byId('device-channels');
const sampleRateElem = byId('sample-rate');
const firmwareTextElem = byId('firmware-text');
const batteryBarElem = byId('battery-bar');
const batteryTextElem = byId('battery-text');

const simTextElem = byId('sim-text');
const simIconElem = byId('sim-icon');

const responseCountElem = byId('response-count');
const responsesListElem = byId('responses-list');

const patternsListElem = byId('patterns-list');

const patternFilterCountElem = byId('pattern-filter-count');
const patternCountElem = byId('pattern-count');

const responseDetailsIdElem = byId('response-details-id');

const logContainer = byId('log-container');
const patternFilterInput = byId('pattern-filter-input');

const eegAvgElem = byId('eeg-avg');
const eegPeakElem = byId('eeg-peak');
const eegTroughElem = byId('eeg-trough');

const yScaleSelect = document.getElementById('yScale');
yScaleSelect.addEventListener('change', (e) => changeYScale(parseInt(e.target.value)));

const connectDeviceBtn = byId('connect-btn');
connectDeviceBtn.addEventListener('pointerup', async (event) => await connectDevice(event));

const disconnectDeviceBtn = byId('disconnect-btn');
disconnectDeviceBtn.addEventListener('pointerup', async (event) => await disconnectDevice(event));

const patternNameElem = byId('pattern-name');
const patternAliasElem = byId('pattern-alias');
const patternDescriptionElem = byId('pattern-description');
const patternConditionChannelElem = byId('condition-channel');
const patternConditionOperatorElem = byId('condition-operator');
const patternConditionThresholdElem = byId('condition-threshold');
const patternConditionDurationElem = byId('condition-duration');
const patternConditionCooldownElem = byId('condition-cooldown');
const patternEnabledElem = byId('pattern-enabled');
const patternActionTypeElem = byId('action-type');
