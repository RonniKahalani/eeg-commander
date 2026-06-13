byId('headband-start').addEventListener('pointerup', async (event) => {
    event.preventDefault();

    const brainbitClient = new BrainbitClient();
    brainbitClient.connect()
        .then(() => {
            // subscriptions and start stream
            // Subscribe to EEG
            brainbitClient.eegStream.subscribe((data) => {
                // data = { val0_ch1, val0_ch2, ... }
                const processed = {
                    ch1: data.val0_ch1,
                    ch2: data.val0_ch2,
                    ch3: data.val0_ch3,
                    ch4: data.val0_ch4
                };
                
                //addToBuffer(data);
                console.log(data)
            });

            return brainbitClient.startEEGStream();
        })
        .catch(err => console.error(err));
})
