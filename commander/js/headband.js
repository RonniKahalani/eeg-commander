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

/**
 * Gets an EEG device via the BrainBit client
 */
async function getEegDevice() {

    const brainbitClient = new BrainbitClient();
    await brainbitClient.connect();
    brainbitClient.eegStream.subscribe((data) => {
        // data = { val0_ch1, val0_ch2, ... }
        addEegData(data);
    });

    await brainbitClient.startEEGStream();
}

/**
 * Adds the EEG data to the EEG buffer.
 * @param {*} data 
 */
function addEegData(data) {
    const processed = {
        ch1: data.val0_ch1,
        ch2: data.val0_ch2,
        ch3: data.val0_ch3,
        ch4: data.val0_ch4
    };

    //addToBuffer(data);
    console.log(data)
}