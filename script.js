let memberNames = {
    "Ishant": "https://instagram.com/ishant.1912",
    "Nitesh": "https://www.instagram.com/niteshlaljani/",
    "bhagyashree": "https://www.instagram.com/reebharate/",
    "UNO": "https://www.instagram.com/ishant.1912/",
    "factor": "https://www.instagram.com/ishant.1912/",
    "Atharv Malve": "https://www.instagram.com/atharvmalve/",
    "Atharv Mane": "https://www.instagram.com/thepasswordspoiler/",
};

let keywords = Object.keys(memberNames); // Extract member names as keywords for matching

let videoElement = document.getElementById('video');
let currentStream = null;
let currentFacingMode = "user"; // Initially use front camera (user)

function setUpCamera() {
    const isMobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent.toLowerCase());
    let constraints = {
        video: {
            facingMode: isMobile ? "environment" : currentFacingMode // "environment" for back camera on mobile, front camera (user) on desktop
        }
    };

    // Stop previous stream if any
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }

    // Request camera access
    navigator.mediaDevices.getUserMedia(constraints)
        .then((stream) => {
            currentStream = stream;
            videoElement.srcObject = stream;
            document.getElementById('scan-button').disabled = false; // Enable scan button once camera is ready
        })
        .catch((err) => {
            console.error("Error accessing the camera: ", err);
            document.getElementById('recognition-result').textContent = "Unable to access camera.";
        });
}

function scanImage() {
    document.getElementById('recognition-result').textContent = "Scanning... Please wait.";

    // Create a canvas to capture the current video frame
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    // Get the image data and pass it to Tesseract.js for OCR
    Tesseract.recognize(
        canvas.toDataURL(),
        'eng',
        {
            logger: (m) => console.log(m)
        }
    ).then(({ data: { text } }) => {
        let recognizedText = text.trim().toLowerCase(); // Make the text lowercase for easier matching
        document.getElementById('recognition-result').textContent = "Recognized: " + recognizedText;

        // Check if any keyword (member name) is found in the recognized text
        let foundMatch = false;
        for (let keyword of keywords) {
            if (recognizedText.includes(keyword.toLowerCase())) { // Case insensitive match
                document.getElementById('recognition-result').textContent = `Recognized: ${keyword}`;
                window.location.href = memberNames[keyword]; // Redirect to the member's URL
                foundMatch = true;
                break; // Stop checking once a match is found
            }
        }

        // If "Atharv" is found but we need further clarification
        if (recognizedText.includes("atharv") && !foundMatch) {
            document.getElementById('atharv-options').classList.remove('hidden');  // Show options if "Atharv" is recognized
        }

        if (!foundMatch && !recognizedText.includes("atharv")) {
            document.getElementById('recognition-result').textContent += " (No match found)";
        }
    }).catch(err => {
        console.error(err);
        document.getElementById('recognition-result').textContent = "Error during scanning!";
    });
}

function redirectToAtharv(choice) {
    let url = memberNames[`Atharv ${choice.charAt(0).toUpperCase() + choice.slice(1)}`];
    if (url) {
        window.location.href = url;
    } else {
        alert("Something went wrong!");
    }
}

// Call the function to set up the camera initially
setUpCamera();