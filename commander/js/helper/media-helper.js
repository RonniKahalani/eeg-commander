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
 * Handles media-related functionalities such as playing tones, sequences, audio files, and text-to-speech. This class abstracts away the complexities of the Web Audio API and provides simple methods for common audio tasks, making it easy to integrate sound effects and speech into the application.
 */
class MediaHelper {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }

    /**
     * Plays a single tone at the specified frequency
     * @param {number} frequency 
     * @param {number} duration
     * @returns {void}
     */
    playFrequency(frequency, duration = 120) {
        const osc = this.ctx.createOscillator();
        osc.frequency.value = frequency;
        osc.connect(this.ctx.destination);
        osc.start();
        setTimeout(() => {
            osc.stop();
        }, duration);
    }

    /**
     * Plays a sequence of tones
     * @param {*} count 
     * @param {*} frequency 
     * @param {*} duration 
     * @param {*} gap
     * @returns {void} 
     */
    playSequence(count = 3, frequency = 880, duration = 150, gap = 200) {
        let time = this.ctx.currentTime;

        for (let i = 0; i < count; i++) {
            const oscillator = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            oscillator.type = 'sine';
            oscillator.frequency.value = frequency;
            gain.gain.value = 0.3;

            oscillator.connect(gain);
            gain.connect(this.ctx.destination);

            oscillator.start(time);
            oscillator.stop(time + duration / 1000);

            time += (duration + gap) / 1000;
        }
    }

    /**
     * Plays an audio file
     * @param {*} url 
     * @returns {Promise<void>}
     */
    playAudio(url) {
        if(isMuted) return;
        
        const audio = new Audio(url);
        audio.play().catch(console.error);
    }

    /**
     * Plays text-to-speech audio
     * @param {*} text 
     * @param {*} rate 
     */
    speak(text, rate = 1.0) {
        if(isMuted) return;
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = rate;
        window.speechSynthesis.speak(utterance);
    }

    /**
     * Show a YouTube video
     * @param {string} url 
     * @param {string} target element to inject the iframe into
     */
     showYouTube(url, target = 'video-container') {
        document.getElementById(target).innerHTML = `<iframe id="video" width="100%" height="100%"
                        src="${url}" title="YouTube video player"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
        
        document.getElementById(target).style.display = 'block';
    }
}

const mediaHelper = new MediaHelper();