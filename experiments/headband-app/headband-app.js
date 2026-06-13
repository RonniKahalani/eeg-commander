const neurosdk = require('js-neurosdk2');

async function main() {
    console.log('🚀 Starting Brainbit Headband Scanner...');

    try {
        // Use startScannerHeadband() as requested
        console.log('Calling startScannerHeadband()...');
        const result = await neurosdk.startScannerHeadband();

        console.log('✅ Scanner result:', result);

        const { name, device, uuid } = result; // device is BluetoothDevice

        if (!device) {
            console.error('No device returned');
            return;
        }

        console.log(`Found Headband: ${name} | UUID: ${uuid}`);

        // Connect to the device
        const connection = await neurosdk.connect(device, uuid);
        console.log('Connection info:', connection);

        // Optional: Check current status
        const status = await neurosdk.getDeviceStatus(device, uuid);
        console.log('Current device status:', status);

        // Put device into Idle mode first
        await neurosdk.goIdle(device, uuid);
        console.log('Device set to Idle');

        // Subscribe to notifications (very important!)
        // You need to attach these handlers before starting signal
        device.addEventListener('characteristicvaluechanged', (event) => {
            neurosdk.handleSignalNotification(event);   // This will log/process EEG data
        });

        // Start EEG streaming
        await neurosdk.goSignal(device, uuid);
        console.log('✅ EEG Streaming started!');

        console.log('\n📊 Listening for EEG data... (4 channels: O1, O2, T3, T4)');

    } catch (error) {
        console.error('❌ Error:', error.message || error);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nShutting down...');
    // You can call neurosdk.goPowerDown() here if needed
    process.exit(0);
});
main().catch(console.error);