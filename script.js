const nameToURL = {
            "Ishant": "https://clubpage.com/ishant",
            "Rahul": "https://clubpage.com/rahul",
            "Priya": "https://clubpage.com/priya",
            "UNO": "https://instagram.com/ishant.1912",
            // Add all 28 members here
        };

        const fallbackURL = "https://instagram.com/gdgcsspu";
        let errorCount = 0;
        const maxErrors = 5;
        const video = document.getElementById('camera');
        const status = document.getElementById('status');

        // Access the device camera
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
                video.srcObject = stream;
            })
            .catch((err) => {
                status.textContent = "Unable to access camera. Please check permissions.";
                console.error(err);
            });

        document.getElementById('captureButton').addEventListener('click', () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            status.textContent = "Processing the image...";
            
            Tesseract.recognize(canvas.toDataURL(), 'eng', { logger: (info) => console.log(info) })
                .then(({ data: { text } }) => {
                    const extractedText = text.toLowerCase();
                    console.log('Extracted Text:', extractedText);

                    let matchedURL = null;
                    for (const [name, url] of Object.entries(nameToURL)) {
                        if (extractedText.includes(name.toLowerCase())) {
                            matchedURL = url;
                            break;
                        }
                    }

                    if (matchedURL) {
                        errorCount = 0;
                        status.textContent = `Name found! Redirecting...`;
                        window.location.href = matchedURL;
                    } else {
                        errorCount++;
                        status.textContent = `Name not found (${errorCount}/${maxErrors}). Try again.`;
                        if (errorCount >= maxErrors) {
                            status.textContent = "Too many errors. Redirecting to Instagram page...";
                            window.location.href = fallbackURL;
                        }
                    }
                })
                .catch((err) => {
                    errorCount++;
                    status.textContent = `Error processing the image (${errorCount}/${maxErrors}). Try again.`;
                    console.error(err);
                    if (errorCount >= maxErrors) {
                        status.textContent = "Too many errors. Redirecting to Instagram page...";
                        window.location.href = fallbackURL;
                    }
                });
        });