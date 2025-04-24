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
  const canvas = faceapi.createCanvasFromMedia(video);
  const container = document.getElementById('video-container');
  container.appendChild(canvas); // Tambahkan canvas ke container

  const displaySize = {
    width: video.videoWidth,
    height: video.videoHeight
  };
  canvas.width = displaySize.width;
  canvas.height = displaySize.height;
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    faceapi.draw.drawDetections(canvas, resizedDetections);

    if (detections.length > 0) {
      const topExp = getTopExpression(detections[0].expressions);
      emojiDisplay.textContent = expressionEmojis[topExp] || "😐";
    }
  }, 300);
});


