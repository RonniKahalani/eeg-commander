# EEG Commander
Ever wished that you could control physical stuff with your mind? That is exactly what Commander enables.

Note: This is a markup of a prototype, not a final product or app.

![Main Page](/docs/images/main.png)

## Features
- Define commands mapped to signal events/values.
- Commands are stored in a configuration file (Yaml).
- Configuration import and export. 
- Test a command manually.
- Currently simulated EEG data.
- Trigger Log.
- Includes a [Shell Server](/shell/README.md) for remote shell execution.

## Command Action Types
- Javascript, access to all context.
- Web/HTTP/Url requests.
- OS-, shell scripts & programs.
- SDK features, like eval(“start_recording”).

## Using JavaScript Actions
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

### Pattern Dialog
![Pattern Dialog](img/pattern-dialog.png)

### What is Cooldown (seconds) in the Pattern Dialog?
The Cooldown is a protection mechanism that prevents the same mental command from triggering too frequently.

| Use-Case                  | Recommanded Cooldown   | Reason |
| --------------------------| :---------------------:| ------ |
| Focus / Productivity mode | 8 – 15 seconds | Avoid spamming ""start focus"" multiple times |
| Break / Stress relief | 5 – 10 seconds | Give user time to react |
| Creative state | 6 – 12 seconds | Prevent rapid repeated triggers |
| Quick alerts (e.g. beeps) | 2 – 5 seconds | Can be more frequent |
| Important actions | 15 – 30 seconds | Safety buffer for critical commands |


## Running the app
If you have VS Code, it is easily run as a simple web app.

Note: 
This is a demo app, not a real product. The EEG chart data are simulated, but the demo gives good insights into the idea.
