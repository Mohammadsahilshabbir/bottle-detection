const video = document.getElementById("webcam");
const canvas = document.getElementById("overlay");
const ctx = canvas.getContext("2d");
const statusEl = document.getElementById("status");

async function setupCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  return new Promise(resolve => {
    video.onloadedmetadata = () => resolve(video);
  });
}

async function loadModelAndDetect() {
  await setupCamera();
  video.play();

  const model = await cocoSsd.load();
  statusEl.innerText = "Model loaded. Detecting...";

  detectFrame(video, model);
}

function detectFrame(video, model) {
  model.detect(video).then(predictions => {
    drawBoxes(predictions);
    requestAnimationFrame(() => detectFrame(video, model));
  });
}

function drawBoxes(predictions) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let plasticCount = 0;
  const plasticLabels = ["bottle", "cup", "handbag"];

  predictions.forEach(pred => {
    if (plasticLabels.includes(pred.class)) {
      plasticCount++;

      const [x, y, width, height] = pred.bbox;

      ctx.strokeStyle = "lime";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);

      ctx.fillStyle = "lime";
      ctx.font = "16px Arial";
      ctx.fillText(pred.class, x, y > 10 ? y - 5 : 10);
    }
  });

  
  document.getElementById("count").textContent = plasticCount;
}



loadModelAndDetect();
