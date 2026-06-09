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
 * Handles UI-related functionalities such as animations and visual effects. This class can be extended in the future to include more complex UI interactions, making it a central place for all UI management tasks in the application.
 */
class UIHelper {
    constructor() { }

    /**
     * Blinks a UI element with a gradient background effect. This can be used to draw attention to specific parts of the interface, such as notifications or alerts. The method applies a transition to the background and toggles between two gradient styles to create a blinking effect.
     * @param {*} element 
     * @param {*} duration
     * @returns {void}
     */
    blinkElement(element, blinkStart = '#f2ee05', blinkEnd = '#1e1135', baseStart = '#020617', baseEnd = '#0f172a', duration = 500) {
        element.style.transition = `background ${duration}ms ease`;
        element.style.background = `linear-gradient(${blinkStart}, ${blinkEnd})`;
            setTimeout(() => {
                element.style.background = `linear-gradient(145deg, ${baseStart} 0%, ${baseEnd} 100%)`;
            }, duration); 
    }

    /**
     * Displays a toast notification with the specified message and details.
     * @param {*} message 
     * @param {*} details
     * @returns {void} 
     */
    toast(message, details = '') {
        showToast(message, details);
    }

    /**
     * Shakes a UI element to indicate an error or highlight an issue.
     * @param {*} element 
     * @param {*} duration
     * @returns {void}
     *  
     */
    shakeElement(element, duration = 3000) {
        element.classList.add("shake");
        setTimeout(() => {
            element.classList.remove("shake");
        }, duration);
    }
}

const uiHelper = new UIHelper();