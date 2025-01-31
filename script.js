// Access the elements
const imageUpload = document.getElementById('imageUpload');
const canvas = document.getElementById('canvas');
const video = document.getElementById('video');
const ctx = canvas.getContext('2d');

// Load hand tracking model (e.g., using TensorFlow.js or MediaPipe)
// This is a placeholder; we'll discuss integrating a model below
let handModel;

// Function to initiate image upload
function uploadPicture() {
    imageUpload.click();
}

// Handle image upload
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const img = new Image();
        img.onload = () => {
            canvas.style.display = 'block';
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            // Pass the image to the gesture recognition function
            recognizeGesturesOnImage(img);
        };
        img.src = URL.createObjectURL(file);
    }
}

// Function to open the camera
function openCamera() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.style.display = 'block';
            video.srcObject = stream;
            // Start gesture recognition on video
            recognizeGesturesOnVideo();
        })
        .catch(err => {
            console.error("Error accessing camera: " + err);
        });
}

// Placeholder function for gesture recognition on image
function recognizeGesturesOnImage(image) {
    // Implement your gesture recognition logic here
    // For now, we'll just log a message
    console.log("Recognizing gestures on the uploaded image...");
}

// Placeholder function for gesture recognition on video
function recognizeGesturesOnVideo() {
    // Implement your real-time gesture recognition logic here
    console.log("Starting real-time gesture recognition...");
    // For example, you could use requestAnimationFrame to process each video frame
}

// Ensure the script runs after the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Variable to store the drawing path
    let drawingPath = [];

    // Function to recognize gestures on video
    function recognizeGesturesOnVideo() {
        const hands = new Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });

        hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        hands.onResults(onResults);

        const camera = new Camera(video, {
            onFrame: async () => {
                await hands.send({image: video});
            },
            width: 640,
            height: 480
        });
        camera.start();
    }

    // Callback function when hands are detected
    function onResults(results) {
        canvas.style.display = 'block';
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the video frame to the canvas
        ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];

            // Extract the tip of the index finger (landmark 8)
            const indexTip = landmarks[8];
            const x = indexTip.x * canvas.width;
            const y = indexTip.y * canvas.height;

            // Add the point to the drawing path
            drawingPath.push({x, y});

            // Draw the path
            ctx.beginPath();
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;
            ctx.moveTo(drawingPath[0].x, drawingPath[0].y);
            for (let i = 1; i < drawingPath.length; i++) {
                ctx.lineTo(drawingPath[i].x, drawingPath[i].y);
            }
            ctx.stroke();

            // Optionally, reset the path after it gets too long
            if (drawingPath.length > 100) {
                drawingPath.shift();
            }
        }
    }

    // Attach functions to the global scope
    window.uploadPicture = uploadPicture;
    window.handleImageUpload = handleImageUpload;
    window.openCamera = openCamera;
});

