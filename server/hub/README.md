# Hub Server
This server is used to aggegate real-time EEG data from multiple EEG Commander clients, via a bidirectional WebSocket connection.

All EEG Commander clients can sends their EEG data to this Hub server which can be used for real-time statistics across multiple EEG devices/commanders.

#### Starting the server
- Go to folder <code>/commander/server/hub</code>
- Run command: <code>node hub-server</code>

If you don't need this server:
- Set <code>hub.host</code> to empty (""), in <code>/commander/data/config.json</code>.

Default config value: <code>ws://localhost:8885</code>.