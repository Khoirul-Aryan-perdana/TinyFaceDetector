const video = document.getElementById('video');
const emojiDisplay = document.getElementById('emoji');

// Define the mapping for face expressions to emoji
const expressionEmojis = {
  happy: "😄",
  sad: "😢",
  angry: "😠",
  surprised: "😲",
  fearful: "😱",
  disgusted: "🤢",
  neutral: "😐"
};

// Start the video feed
async function startVideo() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    video.srcObject = stream;
  } catch (err) {
    console.error("Failed to access webcam:", err);
  }
}

// Load face-api.js models and start video once loaded
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('models'),
  faceapi.nets.faceExpressionNet.loadFromUri('models')
]).then(startVideo);

// Get the top expression based on confidence
function getTopExpression(expressions) {
  return Object.entries(expressions)
    .sort((a, b) => b[1] - a[1])[0][0]; // Sort and return the expression with highest confidence
}

// When video starts playing, initialize the canvas
video.addEventListener('play', () => {
  // Create canvas from the video
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas); // Append the canvas to the body
  
  // Match canvas size to the video
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  // Set an interval to detect faces every 300ms
  setInterval(async () => {
    // Detect all faces with expressions
    const detections = await faceapi.detectAllFaces(
      video,
      new faceapi.TinyFaceDetectorOptions()
    ).withFaceExpressions();

    // Clear the previous canvas content
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

    // Resize the detections to match the video size
    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    // Draw the bounding boxes and expressions on the canvas
    faceapi.draw.drawDetections(canvas, resizedDetections);

    if (detections.length > 0) {
      // Get the top expression and display the corresponding emoji
      const topExp = getTopExpression(detections[0].expressions);
      emojiDisplay.textContent = expressionEmojis[topExp] || "😐"; // Default to neutral if no expression matched
    }
  }, 300); // Run detection every 300ms
});
