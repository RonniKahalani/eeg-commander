# Shell action
SHELL actions executes a shell script on a node.js enabled device.

This type of protocol is not allowed in a browser app, so they a delegated to a [Shell server](/server/shell/README.md).

## Example
The Shell example in the app goes through the following steps:
- Sends a shell command to a local or remote shell server.
- The Shell server executes the OS script locally and returns the output from the script.

## Use cases
- Run OS shell script on any node.js enabled device.
