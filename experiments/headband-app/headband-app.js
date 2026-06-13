const { Neurosdk2, SensorFamily, createScanner, createSensor } = require('js-neurosdk2');

async function main() {
    console.log('Starting Brainbit Node.js app...');

    // Create scanner for Brainbit devices
    const scanner = createScanner([
        SensorFamily.SensorLEBrainBit,
        SensorFamily.SensorLEBrainBit2,
        SensorFamily.SensorLEHeadband
    ]);

    // Subscribe to found devices
    scanner.on('sensors', (sensors) => {
        console.log('Found devices:', sensors);
        
        if (sensors.length > 0) {
            const deviceInfo = sensors[0]; // Take the first one
            connectToDevice(deviceInfo);
        }
    });

    // Start scanning
    await scanner.start();
    console.log('Scanning for Brainbit headband...');
}

async function connectToDevice(deviceInfo) {
    console.log('Connecting to:', deviceInfo.Name);

    const sensor = createSensor(deviceInfo);

    // Connection state listener
    sensor.on('state', (state) => {
        console.log('Connection state:', state);
    });

    // Battery listener
    sensor.on('battery', (level) => {
        console.log('Battery:', level, '%');
    });

    try {
        await sensor.connect();
        console.log('✅ Connected successfully!');

        // Subscribe to EEG data (4 channels)
        const eegChannel = sensor.createEegChannel(); // or appropriate method

        eegChannel.on('data', (data) => {
            // data typically contains array of samples with 4 channels
            console.log('EEG Data:', {
                timestamp: Date.now(),
                ch1: data[0]?.O1 || data[0]?.ch1,
                ch2: data[0]?.O2 || data[0]?.ch2,
                ch3: data[0]?.T3 || data[0]?.ch3,
                ch4: data[0]?.T4 || data[0]?.ch4,
            });
        });

        // Start signal streaming
        await sensor.startSignal();

        console.log('Streaming EEG data... Press Ctrl+C to stop.');

    } catch (error) {
        console.error('Connection failed:', error);
    }
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down...');
    process.exit(0);
});

main().catch(console.error);