# Shell Server
This server executes OS shell scripts- and UDP actions on behalf of EEG Commander clents, via HTTP POST requests.

## Starting the server:
- Go to folder <code>/commander/server/shell</code>
- Run command <code>node shell-server</code> to start the server.

If you don't need this server:
- Set <code>shell.host</code> to an empty ("") in <code>/commander/data/config.json</code>.

Default config value: <code>http://localhost:3000</code>.

![Shell Server](/docs/images/shell-server.png)

## Purpose
Because a web app is not allowed to run local OS system commands or send UDP messages itself, we use a shell server.

The shell server can run on any local or remote Node.js enabled device.

An execute request is triggered by a HTTP POST with the command to run, via the <code>/execute</code> endpoint, on the shell server:

<pre>
<code type="javascript">const response = await fetch('http://localhost:3000/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: 'echo hello' })
    });</code>
</pre>

## How it works
A Commander app sends a shell request to the Shell server and gets a response with the output of the executed command.

The server can be used in two different setups:
- Run on the same node/device as the EEG Commander app.
- Run one remote central Shell server shared by multiple EEG Commander apps.

## Security
Having a node executing OS/Shell commands, sent from outside can be fatal, if they have malicious (harmful) intentions.

Therefore this app supports configuration (config.json) for
- Allowed command patterns, only registered commands are allowed.
- Allowed hosts and referers, anyone else is blocked.
- Bad command patterns list, initially blocks commands that can be harmful.
- API key check.