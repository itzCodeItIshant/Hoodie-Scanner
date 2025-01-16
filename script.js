// Mapping names to URLs
const nameToURL = {
    "Ishant": "https://clubpage.com/ishant",
    "Rahul": "https://clubpage.com/rahul",
    "Priya": "https://clubpage.com/priya",
    "Atharv Malve": "https://clubpage.com/atharv_malve",  // Updated with full name
    "Atharv Mane": "https://clubpage.com/atharv_mane",    // Updated with full name
    // Add all 28 members here
};

const fallbackURL = "https://instagram.com/gdgcsspu"; // Redirect if repeated errors occur
let errorCount = 0; // Track consecutive errors
const maxErrors = 5; // Maximum allowed consecutive errors before redirecting
const video = document.getElementById('camera');
const status = document.getElementById('status');
const choiceButtons = document.getElementById('choiceButtons');
const choiceText = document.getElementById('choiceText');
const atharvMalveButton = document.getElementById('atharvMalve');
const atharvManeButton = document.getElementById('atharvMane');

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
            const extractedText = text.toLowerCase(); // Convert to lowercase for case-insensitive matching
            console.log('Extracted Text:', extractedText);

            // Check if the name "Atharv" is in the extracted text
            if (extractedText.includes("atharv")) {
                // Hide the camera and status, show the choice buttons
                video.style.display = 'none';
                status.style.display = 'none';
                choiceButtons.style.display = 'block';

                // Set up the button click events
                atharvMalveButton.addEventListener('click', () => {
                    window.location.href = nameToURL["Atharv Malve"];
                });
                atharvManeButton.addEventListener('click', () => {
                    window.location.href = nameToURL["Atharv Mane"];
                });
            } else {
                // Handle other name cases
                let matchedURL = null;
                for (const [name, url] of Object.entries(nameToURL)) {
                    if (extractedText.includes(name.toLowerCase())) {
                        matchedURL = url;
                        break;
                    }
                }

                if (matchedURL) {
                    errorCount = 0; // Reset error count on success
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
