// Mapping names to URLs
const nameToURL = {
    "Ishant": "https://instagram.com/ishant.1912",
    "Nitesh": "https://www.instagram.com/niteshlaljani/",
    "bhagyashree": "https://www.instagram.com/reebharate/",
    "UNO": "https://www.instagram.com/ishant.1912/",
    "factor": "https://www.instagram.com/ishant.1912/",
    // Add all 28 members here
};

const fallbackURL = "https://instagram.com/gdgcsspu"; // Redirect if repeated errors occur
let errorCount = 0; // Track consecutive errors
const maxErrors = 5; // Maximum allowed consecutive errors before redirecting
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

    // Process the captured frame
    Tesseract.recognize(canvas.toDataURL(), 'eng', { logger: (info) => console.log(info) })
        .then(({ data: { text } }) => {
            const extractedText = text.toLowerCase();
            console.log('Extracted Text:', extractedText);

            // Check if the extracted text matches any name
            let matchedURL = null;
            for (const [name, url] of Object.entries(nameToURL)) {
                if (extractedText.includes(name.toLowerCase())) {
                    matchedURL = url;
                    break;
                }
            }

            // If name is found, redirect to the corresponding URL
            if (matchedURL) {
                errorCount = 0; // Reset error count on success
                status.textContent = `Name found! Redirecting...`;
                window.location.href = matchedURL;
            } else if (extractedText.includes("atharv")) {
                // If "Atharv" is detected, show the name choice
                showAtharvChoice();
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

// Show the name choice options if "Atharv" is detected
function showAtharvChoice() {
    document.getElementById('nameChoice').style.display = 'block';

    // Handle the user selection
    document.getElementById('atharvMalve').addEventListener('click', () => {
        status.textContent = "Redirecting to Atharv Malve's page...";
        window.location.href = "https://www.instagram.com/atharvmalve/";
    });

    document.getElementById('atharvMane').addEventListener('click', () => {
        status.textContent = "Redirecting to Atharv Mane's page...";
        window.location.href = "https://www.instagram.com/thepasswordspoiler/";
    });
}
