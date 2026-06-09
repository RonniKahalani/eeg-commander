/**
 * This is a sample code used by an EEG Commander JavaScript action.
 */

/**
 * Plays a project local audio file
 */
JS.MEDIA.playAudio('/commander/audio/chime.mp3');

/**
 * Make an element on the page blink in colors
 */
const bodyElement = document.getElementsByTagName('body')[0];
JS.UI.blinkElement(bodyElement, 'orange');

/**
 * Shakes an element on the page
 */
const videoContainerElement = document.getElementById('video-container');
JS.UI.shakeElement(videoContainerElement);

/**
 * Shows a YouTube video
 */
const videos = [
    'https://www.youtube.com/embed/ZToicYcHIOU?si=rEJFvNL17QPLNFXy',
    'https://www.youtube.com/embed/swjDIvuxFx4?si=qQ8LJKDznXqUzWGO',
    'https://www.youtube.com/embed/syx3a1_LeFo?si=rRPiMzmg9ro2Eb4t',
    'https://www.youtube.com/embed/N06bGR4c_Rw?si=ejhGIoCPPOFV7zmv',
    'https://www.youtube.com/embed/KTMBWUkFimY?si=CoTlq9VrZK2uOXTl',
    'https://www.youtube.com/embed/PsebozmOx7I?si=qwzW7SS3KHou-Xv0',
    'https://www.youtube.com/embed/TaB4Z-e_07E?si=gQV8b9ptxoGUWtcW'
];

const randomIndex = Math.floor(Math.random() * videos.length);
JS.MEDIA.showYouTube(videos[randomIndex]);

/**
 * Speaks and shows a toast (popup) message
 */
const message = "Did you notice the YouTube changed randomly?";
JS.UI.toast("Relaxation detected", message, 5000);
JS.MEDIA.speak(message);


/**
 * Shows the use of return values  
 */
return { message: "Hi I'm the return value from the JS Video pattern action."};