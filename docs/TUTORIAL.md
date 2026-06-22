# EEG Commander Tutorial
This tutorial will help you get started and has the following steps.
- Introduction
- Create pattern.
- Select EEG trigger signal.
- Select action type.
- Start simulation.
- Test pattern.

## Introduction
The purpose of this tutorial is to help you make your first new pattern.

First you have to take some choices
- Are you going to use a Shell server for executing OS shell script- and UDP actions?
- Are you going to use a Hub server to send EEG data to?
- Are you going to use a UDP Echo server for testing?
- Are you going to use a WebSocket Echo server for testing?

### Using the Shell server
- Go to folder <code>/commander/server/shell</code>
- Run command <code>node shell-server</code>

If you don't want to use this server, leave <code>shell.host</code> empty in the <code>/commander/data/config.json</code> configuration file. Read more about the [Shell server](/server/shell/README.md)

### Using the Hub server
- Go to folder <code>/commander/server/hub</code>
- Run command: <code>node hub-server</code>

If you don't want to use this server, leave <code>hub.host</code> empty in the <code>/commander/data/config.json</code> configuration file.  Read more about the [Hub server](/server/hub/README.md)

### Using the UDP Echo server for testing
- Go to folder <code>/commander/server/udp</code>
- Run command: <code>node udp-server</code>

### Using the WebSocket Echo server for testing
- Go to folder <code>/commander/server/socket</code>
- Run command: <code>node socket-server</code>

## Create pattern
Start by checking out this about [EEG Patterns](/docs/PATTERNS.md).

The quickest way to make a new pattern is to clone an existing one of the same action type.

- Click the "clone" icon on an existing JavaScript pattern (JS).
- Add a new pattern name (title) and alias (used as a persistant reference id).
- Change the .js file to one you've made and placed in the <code>/commander/data/js</code> folder or reference an external .js file available via the internet.
- Set pattern condition, to match your needs.
- Enable the pattern.
- Activate the EEG device or run a simulation.

**Note**: Your new pattern currently only exists in the local storage of the browser. To persist it on disk use the export feature on the Patterns Tab.

## Set pattern condition
Select your condition 


## Set action type
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