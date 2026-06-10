# EEG Commander Tutorial
This tutorial will help you get started.
- Introduction
- What's a pattern?
- Create pattern.
- Select EEG trigger signal.
- Select action type.
- Test pattern.

## Introduction
The purpose of EEG Commander is to offer an integration layer for web-based EEG apps.

## What's a pattern?
A pattern is a declaration of
- General info like name, description, enabled etc.
- Condition - When to trigger based on EEG signal patterns
- Action - What to do when triggered like running code or sending data.

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

### Pattern condition
A condition defines a set of channels and a value threshold for a given period. If this is triggered the action part of the pattern is activated.
This pattern will not be activated again before the cooldown period has passed.

### Pattern action type
A action type defines which kind of integration to use when triggered. Current action types are:
- JavaScript
- URL
- WebSocket
- UDP
- MQTT
- OS Shell

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
