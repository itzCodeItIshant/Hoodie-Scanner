document.getElementById('image-upload').addEventListener('change', handleImageUpload);
document.getElementById('scan-button').addEventListener('click', scanImage);

let memberNames = {
    "Ishant": "https://instagram.com/ishant.1912",
    "Nitesh": "https://www.instagram.com/niteshlaljani/",
    "bhagyashree": "https://www.instagram.com/reebharate/",
    "UNO": "https://www.instagram.com/ishant.1912/",
    "factor": "https://www.instagram.com/ishant.1912/",
    "Atharv Malve": "https://www.instagram.com/atharvmalve/",
    "Atharv Mane": "https://www.instagram.com/thepasswordspoiler/",
};

let imageToScan = null;

let videoElement = document.getElementById('video');
let currentStream = null;
let currentFacingMode = "user"; // Initially use front camera (user)

function handleImageUpload(event) {
    imageToScan = event.target.files[0];
    document.getElementById('scan-button').disabled = false;
    document.getElementById('recognition-result').textContent = "Ready to scan!";
    document.getElementById('atharv-options').classList.add('hidden');  // Hide options initially
}

function scanImage() {
    if (!imageToScan) return;

    document.getElementById('recognition-result').textContent = "Scanning image...";

    Tesseract.recognize(
        imageToScan,
        'eng',
        {
            logger: (m) => console.log(m)
        }
    ).then(({ data: { text } }) => {
        let recognizedName = text.trim();
        document.getElementById('recognition-result').textContent = "Recognized: " + recognizedName;

        if (recognizedName === "Atharv") {
            document.getElementById('atharv-options').classList.remove('hidden');
        } else if (memberNames[recognizedName]) {
            window.location.href = memberNames[recognizedName];
        } else {
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

// Detect device platform and set up the camera accordingly
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
        })
        .catch((err) => {
            console.error("Error accessing the camera: ", err);
            document.getElementById('recognition-result').textContent = "Unable to access camera.";
        });
}

// Function to switch between front and back camera
function switchCamera() {
    currentFacingMode = currentFacingMode === "user" ? "environment" : "user"; // Toggle between user and environment
    setUpCamera(); // Reinitialize the camera with the new facingMode
}

// Call the function to set up the camera initially
setUpCamera();
