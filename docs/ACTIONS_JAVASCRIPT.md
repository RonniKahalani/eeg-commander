# JavaScript Actions
This type of action enables evaluating (running) JavaScript at runtime, with the Browser context and included scripts/libraries available. 

You can supply your JavaScript in one of two ways
- Paste in some code directly <code>console.log('Hello World')</code>, or
- Let the first (and only) line be an url like <code>http://somehost.com/code/test.js</code>

There is also supplied some additional helper classes:

### Audio Helper (JS.AUDIO)
- playFrequency(frequency, duration = 120)
- playSequence(count = 3, frequency = 880, duration = 150, gap = 200)
- speak(message, rate=1.0)
- playAudio(url)

#### Examples
Talk to the user using the speech API.
<pre><code>JS.AUDIO.speak("Hey you, wake up!");</code></pre>

Play an mp3 audio file.
<pre><code>JS.AUDIO.playAudio("htp://somewhere.com/someaudio.mp3");</code></pre>

### UI Helper (JS.UI)
- blinkElement(element, duration = 500)
- shakeElement(element, duration = 3000)
- toast(message, details = '')

#### Examples
Make the page background change colors for 300 millis.
<pre><code>JS.UI.blinkElement(document.body, 300);</code></pre>

Show a toast (popup) to the user with title and description.
<pre><code>JS.UI.toast("The Title", "The Description");</code></pre>