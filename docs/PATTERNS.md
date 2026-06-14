# Patterns
A pattern is a declaration of

- General info like name, description, enabled etc.
- Condition - When to trigger based on EEG signal patterns
- Action - What to do when triggered like running code or sending data.


Patterns are used to trigger an action when its condition is matched up against an EEG data stream.

## Condition
In this condition example the pattern will trigger its action when:
- the average, across all channels, gets below (<) the specified threshold of 12 microvolts (µV) for a given duration (4) seconds.

The pattern will not trigger again until its cool down time (5) has passed.

![Main Page](/docs/images/pattern-condition.png)

### What is Cooldown (seconds)?
The Cooldown is a protection mechanism that prevents the same mental command from triggering too frequently.

| Use-Case                  | Recommanded Cooldown   | Reason |
| --------------------------| :---------------------:| ------ |
| Focus / Productivity mode | 8 – 15 seconds | Avoid spamming ""start focus"" multiple times |
| Break / Stress relief | 5 – 10 seconds | Give user time to react |
| Creative state | 6 – 12 seconds | Prevent rapid repeated triggers |
| Quick alerts (e.g. beeps) | 2 – 5 seconds | Can be more frequent |
| Important actions | 15 – 30 seconds | Safety buffer for critical commands |


## Action
There are different types of actions, but common for them all is that they perform a front- or backend action.

### Action types
- [JavaScript](/docs/ACTIONS_JAVASCRIPT.md)
- [Url (Web/HTTP)](/docs/ACTIONS_URL.md)
- [WebSocket](/docs/ACTIONS_WEBSOCKET.md)
- [UDP](/docs/ACTIONS_UDP.md)
- [MQTT](/docs/ACTIONS_MQTT.md)
- [OS shell](/docs/ACTIONS_SHELL.md)
- [SDK features](/docs/ACTIONS_SDK.md)

## Patterns Tab
Lists defined EEG patterns. A pattern consist of a condition and an action.
Each row repesents a pattern with actions like
- edit, clone, delete, run and enable.

## Create pattern
To register a new pattern you can add it to the default patterns in the Yaml file <code>/commander/data/patterns/eeg-patterns-default.yaml</code>

Remember to reset the pattern list so it reads the default patterns file. You can also import and export the current patterns in the app.

The default or imported patterns are saved to local storage in the browser, not to any external file.

This shows an example of a patterns file with only one pattern:
<pre>
patterns:
    name: Relaxed (JS - Video)
    description: Detects high focus states using a moving average of absolute values across all channels.  
    enabled: false
    condition:
      channel: avg
      metric: moving_avg_abs
      operator: <
      threshold: 12
      duration: 4
    action:
      type: js
      payload: ./data/js/demo-action-video.js
    cooldown: 12
</pre>

## Only using the integration layer
In reality you could totally refactor the index.html page and hide all the pattern and EEG UI, totally customize it for your app purpose but still use the core EEG Commander layer to react to patterns in an EEG data stream supplied by your app.

## Adding your own integration type
You can easily add new integration types, with a few code additions.

### In <code>actions.js</code>
- Add your own <code>async function execute[Type]Action(pattern, eeg)</code>
- Add a call to your action type in the switch statement in <code>function executePattern(pattern, metricValue, eeg)</code>

### In <code>patterns.js</code>
- Add a background color for your action type in <code>function getActionTypeColor(type)</code>

### In <code>dialogs.js & index.html</code>
- If you want your users to create or edit the patterns you have to add a UI to the patterns dialog HTML in the <code>index.html</code> and dialog logic like save and edit in <code>dialogs.js</code>


### Pattern Dialog
![Pattern Dialog](/docs/images/pattern-dialog.png)
