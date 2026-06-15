# UDP action
UDP actions sends data to an UDP server host on a given port.

This type of protocol is not allowed in a browser app, so they a delegated to a [Shell server](/server/shell/README.md).

## Example
The UDP example in the app goes through the following steps:
- Sends an UDP command to a local or remote shell server.
- The Shell server executes the UDP request and returns the response from the UDP host.
- Either does a "fire and forget", waits for a given number of reply messages or times out.

## Use cases
- Send UDP message to games, live streaming service and UDP controlled devices.