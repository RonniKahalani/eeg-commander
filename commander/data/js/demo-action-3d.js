/**
 * This is a sample code used by an EEG Commander JavaScript action.
 */

/**
 * Plays a project local audio file
 */
JS.MEDIA.playAudio('/commander/audio/church-bell.mp3');

/**
 * Make an element on the page blink in colors
 */
const bodyElement = document.getElementsByTagName('body')[0];
JS.UI.blinkElement(bodyElement);

/**
 * Shakes an element on the page
 */
const view3DElement = document.getElementById('view3d');
JS.UI.shakeElement(view3DElement);

/**
 * Moves the pin in the 3D view on the dashboard and changes the material color with random colors
 */
JS.THREE.up(1);
JS.THREE.setColor(Math.random(), Math.random(), Math.random());

/**
 * Speaks and shows a toast (popup) message
 */
const message = "Did you notice the pin in the 3D view went up and changed to a random color?";
JS.UI.toast("Relaxation detected", message, 5000);
JS.MEDIA.speak(message);

/**
 * Shows the use of return values  
 */
//console.log("EEG data available in the action:", eeg ? JSON.stringify(eeg) : '[]');
return { message: "Hi I'm the return value from the JS 3D pattern action."};