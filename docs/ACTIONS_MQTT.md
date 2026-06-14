# MQTT action
MQTT actions sends a message via a broker to message queue topic.

This type of protocol is often used by IoT (Internet of Things) devices.

## Example
The MQTT example in the app goes through the following steps:
- Connects to a message queue (MQ) broker.
- Sends a message to a given topic.
- Either does a "fire and forget", waits for a given number of reply messages or times out.

## Use cases
- Communicating many different type of IoT and robotic devices.