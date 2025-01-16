// Load the reference GDGC logo image
const gdgcLogo = new Image();
gdgcLogo.src = 'gdgc-logo.png';  // Make sure this image path is correct

// Mapping names to URLs
const nameToURL = {
    "Ishant": "https://instagram.com/ishant.1912",
    "Ishant": "https://instagram.com/ishant.1912",
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

    // First, try to recognize text using Tesseract.js
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
            } else {
                // If no name is found, check for GDGC logo detection
                if (isLogoDetected(canvas)) {
                    status.textContent = "GDGC Logo detected! Redirecting...";
                    window.location.href = "https://gdg.community.dev/gdg-on-campus-symbiosis-skills-professional-university-pune-india/";
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

// Function to compare the captured image with the GDGC logo
function isLogoDetected(canvas) {
    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const imgPixels = imgData.data;

    // Dimensions of the logo
    const logoWidth = gdgcLogo.width;
    const logoHeight = gdgcLogo.height;

    // Draw the GDGC logo on a temporary canvas for comparison
    const logoCanvas = document.createElement('canvas');
    const logoCtx = logoCanvas.getContext('2d');
    logoCanvas.width = logoWidth;
    logoCanvas.height = logoHeight;
    logoCtx.drawImage(gdgcLogo, 0, 0);

    // Get the pixel data of the logo
    const logoData = logoCtx.getImageData(0, 0, logoWidth, logoHeight);
    const logoPixels = logoData.data;

    // Loop through the pixels of both images and compare them
    const tolerance = 0.1;  // Tolerance for pixel matching (can be adjusted)
    const matchingPixels = [];

    // For simplicity, we compare a small region of the image (e.g., top-left corner)
    for (let y = 0; y < logoHeight; y++) {
        for (let x = 0; x < logoWidth; x++) {
            const pixelIndexCanvas = (y * canvas.width + x) * 4;
            const pixelIndexLogo = (y * logoWidth + x) * 4;

            // Get the RGBA values from both the captured image and the logo
            const rCanvas = imgPixels[pixelIndexCanvas];
            const gCanvas = imgPixels[pixelIndexCanvas + 1];
            const bCanvas = imgPixels[pixelIndexCanvas + 2];
            const aCanvas = imgPixels[pixelIndexCanvas + 3];

            const rLogo = logoPixels[pixelIndexLogo];
            const gLogo = logoPixels[pixelIndexLogo + 1];
            const bLogo = logoPixels[pixelIndexLogo + 2];
            const aLogo = logoPixels[pixelIndexLogo + 3];

            // Check if the pixel values match within the tolerance
            const diff = Math.abs(rCanvas - rLogo) + Math.abs(gCanvas - gLogo) + Math.abs(bCanvas - bLogo);
            if (diff < tolerance * 255) {
                matchingPixels.push([x, y]);
            }
        }
    }

    // If enough pixels match, consider the logo detected
    const matchingThreshold = 0.5; // Percentage of matching pixels to trigger logo detection
    const totalLogoPixels = logoWidth * logoHeight;
    const matchingPercentage = matchingPixels.length / totalLogoPixels;

    return matchingPercentage > matchingThreshold;
}