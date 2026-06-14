# Patterns
A pattern consists of two components, a condition and action. 

They are used to trigger an action when its condition is matched up against an EEG data stream.

## Condition
In this condition example the pattern will trigger its action when:
- the average, across all channels, gets below (<) the specified threshold of 12 microvolts (µV) for a given duration (4) seconds.

The pattern will not trigger again until its cool down time (5) has passed.

![Main Page](/docs/images/pattern-condition.png)

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

### Pattern Dialog
![Pattern Dialog](/docs/images/pattern-dialog.png)

### What is Cooldown (seconds) in the Pattern Dialog?
The Cooldown is a protection mechanism that prevents the same mental command from triggering too frequently.

| Use-Case                  | Recommanded Cooldown   | Reason |
| --------------------------| :---------------------:| ------ |
| Focus / Productivity mode | 8 – 15 seconds | Avoid spamming ""start focus"" multiple times |
| Break / Stress relief | 5 – 10 seconds | Give user time to react |
| Creative state | 6 – 12 seconds | Prevent rapid repeated triggers |
| Quick alerts (e.g. beeps) | 2 – 5 seconds | Can be more frequent |
| Important actions | 15 – 30 seconds | Safety buffer for critical commands |
