# Launching the EEG Commander app
Go through these steps to launch the app in a browser.

## Notice
Only Chrome, Edge and Opera browsers supports the needed Bluetooth Web API used to connect to the EEG device (BrainBit Headband).

Firefox does not support the Bluetooth Web API and will not connect to a device, but you can still use the EEG simulator and play with the app as if you had a device.

## Get the code
- Clone or fork the app from <code>https://github.com/RonniKahalani/eeg-commander</code>
## Open the project (ex. VS Code)
- Open the <code>eeg-commander</code> folder.

## Start a Shell server
- Can be ignored if you're not using Shell or UDP actions.
- Open the <code>/server/shell</code> folder in a terminal window.
- Run the command <code>node shell-server</code>

If you're running the shell server on a device remote from the Commander app, you have to point to it via the <code>shell.host</code> property in the <code>config.json</code> file.

## Launch the web app
- Select the file <code>/commander/index.html</code>
- Click <code>Go Live!</code> (requires the Live Server plugin).

## Checking the the app functions properly
- Go to the bottom of the page (teh trigger log) and validate that the the app found the expected shell server.
- Click the Patterns Tab. Are there any patterns? If not,  something went wrong. You should expect to se 7 patterns in the list.
- Go to the EEG tab to test the simulation.
- Click the Connect button in the top left, but cancel the Bluetooth dialog (then the simulation should start as a backup feature)
- Select a pattern from the Patterns tab to enable, to test if it triggers.

That should do the trick. If all tests went well you should be raedy to do something cool.