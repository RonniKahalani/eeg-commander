# Launching the EEG Commander app
Go through these steps to launch the app in a browser.

## Notice
Only Chrome, Edge and Opera browsers supports the needed Bluetooth Web API used to connect to the EEG device (BrainBit Headband).

Firefox does not support the Bluetooth Web API and will not connect to a device, but you can still use the EEG simulator and play with the app as if you had a device.

## Get the code
- Clone or fork the app from <code>https://github.com/RonniKahalani/eeg-commander</code>

## Open the project (ex. VS Code)
- Open the <code>eeg-commander</code> folder.

## Launch the web app
- Select the file <code>/commander/index.html</code>
- Click <code>Go Live!</code> (requires the Live Server plugin).

## Initial server connection error in the trigger log
You should have one server connection error, for a shell server, in the trigger log in the bottom of the interface. 

Thit is because the EEG Commander, by default, is looking for a local Shell server, but you haven't started the server yet. So you're currently not able to run Shell or UDP pattern actions, which is what the Shell server offers.

### Start the needed server
Go through this [Tutorial](/docs/TUTORIAL.md) to learn how to start the different servers and create your own [patterns](/docs/PATTERNS.md).

### Refresh the EEG Commander browser window
After you've startet the servers you need, press (F5-key or CTRL-R in Windows) to refresh the browser window and the EEG Commander app will try to connect to the servers you've declared in the config file <code>/commander/data/config.json</code>, following the tutorial guidelines.

## Checking the the app functions properly
- Go to the bottom of the page (to the trigger log) and validate that the app found the expected shell server.
- Click the Patterns Tab. Are there any patterns? If not, something went wrong. You should expect to se 7 patterns in the list.
- Go to the EEG tab to test the simulation.
- Click the Simulate button in the top right corner.
- Select a pattern from the Patterns tab to enable, to test if it triggers.

That should do the trick. If all tests went well you should be ready to do something cool.