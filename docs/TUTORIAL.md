# EEG Commander Tutorial
This tutorial will help you get started and has the following steps.
- Introduction
- Using the servers.
- Create pattern.
- Select condition.
- Select action type.
- Start simulation.
- Test pattern.

## Introduction
The purpose of this tutorial is to help you make your first new pattern.

## Using the servers
First you have to take some choices
- Do you need a Shell server?
- Do you need a Hub server?
- Do you need an UDP echo server?
- Do you need a WebSocket echo server?

### Do you need the Shell server?
This server executes OS shell scripts- and UDP actions on behalf of EEG Commander clents, via HTTP POST requests. Read more about [Shell server](/server/shell/README.md)

### Do you need a Hub server?
This server is used to aggegate real-time EEG data from multiple EEG Commander clients, via a bidirectional WebSocket connection. Read more about [Hub server](/server/hub/README.md)

### Do you need an UDP server?
This server is for UDP echo purposes for the EEG Commander clients. Read about [UDP server](/server/udp/README.md)

### Do you need a WebSocket server?
This server is for WebSocket echo purposes for the EEG Commander clients. Read about [Socket server](/server/socket/README.md)

## Create pattern
Start by getting to know [EEG Patterns](/docs/PATTERNS.md).

The quickest way to make a new pattern is to clone an existing one of the same action type.

- Click the "clone" icon on an existing JavaScript pattern (JS).
- Add a new pattern name (title) and alias (used as a persistant reference id).
- Change the .js file to one you've made and placed in the <code>/commander/data/js</code> folder or reference an external .js file available via the internet.
- Set pattern condition, to match your needs.
- Enable the pattern.
- Activate the EEG device or run a simulation.

**Note**: Your new pattern currently only exists in the local storage of the browser. To persist it on disk use the export feature on the Patterns Tab.

### Set pattern condition
Select your condition

![Main Page](/docs/images/pattern-condition.png)


### Set action type
Select one of the available action types for your pattern
- [JS](ACTIONS_JAVASCRIPT.md)
- [URL](ACTIONS_URL.md)
- [SOCKET](ACTIONS_WEBSOCKET.md)
- [SHELL](ACTIONS_SHELL.md)
- [UDP](ACTIONS_UDP.md)
- [MQTT](ACTIONS_MQTT.md)
- [SDK](ACTIONS_SDK.md)


## Test pattern
Find your pattern on the Patterns Tab and click your patterns play icon to test it manually.