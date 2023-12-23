//             ./#&@@@@@@@@@@@%(*.             
//       .*#@@@@@@@@@@@@@@@@@@@@@@@@&(,.       
//  *%@@@@@@@@@@@@@@&%#(((#%@@@@@@@@@@@@@@@(,      SYNTHEYESIS - Proqram Emin Həziyev və Rza Həsənzadə tərəfindən 
//.@@@@@@@@@@@%/,*(((((((((((((*,(&@@@@@@@@@@%.    yazılıb. Bütün hüquqları qorunur.
//.@@@@@@(,     .(((((.   *((((/.    .*#@@@@@%.    Layihənin əsas məqsədi iflic insanları müəyyən qədər sosial həyata geri qaytarmaqdır.
//.@@@@@@@&(,.  .((((((*,/(((((*.  .*#@@@@@@@%.
//.@@@@@@@@@@@@@@%((((((((((((#%@@@@@@@@@@@@@%.
//   .,/%@@@@@@@@@@@@@@&&@@@@@@@@@@@@@@@#/,    
//          *#%@@@@@@@@@@@@@@@@@@&%(,          
//                .(%@@@@@@&#/.  
import vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";
const { FaceLandmarker, FilesetResolver, DrawingUtils } = vision;
const demosSection = document.getElementById("demos");
const imageBlendShapes = document.getElementById("image-blend-shapes");
const videoBlendShapes = document.getElementById("video-blend-shapes");
let faceLandmarker;
let runningMode = "IMAGE";
let enableWebcamButton;
let webcamRunning = false;
const videoWidth = 200;


// Süni intellekt modeli yüklənir
async function createFaceLandmarker() {
  const filesetResolver = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm");
  faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
      delegate: "GPU"
    },
    outputFaceBlendshapes: true,
    runningMode,
    numFaces: 1
  });
  demosSection.classList.remove("invisible");
}
createFaceLandmarker();






const imageContainers = document.getElementsByClassName("detectOnClick");

for (let imageContainer of imageContainers) {
  
  imageContainer.children[0].addEventListener("click", handleClick);
}

async function handleClick(event) {
  if (!faceLandmarker) {
    console.log("Wait for faceLandmarker to load before clicking!");
    return;
  }
  if (runningMode === "VIDEO") {
    runningMode = "IMAGE";
    await faceLandmarker.setOptions({ runningMode });
  }
  
    // Əvvəl çəkilmiş bütün blendShapes təmizlənir
  const allCanvas = event.target.parentNode.getElementsByClassName("canvas");
  for (var i = allCanvas.length - 1; i >= 0; i--) {
    const n = allCanvas[i];
    n.parentNode.removeChild(n);
  }
  
  
  
  
  const faceLandmarkerResult = faceLandmarker.detect(event.target);
  const canvas = document.createElement("canvas");
  canvas.setAttribute("class", "canvas");
  canvas.setAttribute("width", event.target.naturalWidth + "px");
  canvas.setAttribute("height", event.target.naturalHeight + "px");
  canvas.style.left = "0px";
  canvas.style.top = "0px";
  canvas.style.width = `${event.target.width}px`;
  canvas.style.height = `${event.target.height}px`;
  event.target.parentNode.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  const drawingUtils = new DrawingUtils(ctx);
  for (const landmarks of faceLandmarkerResult.faceLandmarks) {
    drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_TESSELATION, { color: "#C0C0C070", lineWidth: 1 });
    drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE, { color: "#FF3030" });
    drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW, { color: "#FF3030" });
    drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYE, { color: "#30FF30" });
    drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW, { color: "#30FF30" });
    drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_FACE_OVAL, { color: "#E0E0E0" });
    drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LIPS, {
      color: "#E0E0E0"
    });
    drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS, { color: "#FF3030" });
    drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS, { color: "#30FF30" });
  }
  drawBlendShapes(imageBlendShapes, faceLandmarkerResult.faceBlendshapes);
}



const video = document.getElementById("webcam");
const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d");

function hasGetUserMedia() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}


if (hasGetUserMedia()) {

  enableWebcamButton = document.getElementById("webcamButton");
  enableWebcamButton.click();
  enableWebcamButton.addEventListener("click", enableCam);
  enableWebcamButton.click();
}
else {
  console.warn("getUserMedia() is not supported by your browser");
}

function enableCam(event) {
  if (!faceLandmarker) {
    console.log("Wait! faceLandmarker not loaded yet.");
    return;
  }
  if (webcamRunning === true) {
    webcamRunning = false;
    enableWebcamButton.innerText = "Yandir";
  }
  else {
    webcamRunning = true;
    enableWebcamButton.innerText = "Sondur";
  }
  
  const constraints = {
    video: true
  };
  


  navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    video.srcObject = stream;
    video.addEventListener("loadeddata", predictWebcam);
  });
}

let lastVideoTime = -1;
let results = undefined;
const drawingUtils = new DrawingUtils(canvasCtx);
async function predictWebcam() {
  const radio = video.videoHeight / video.videoWidth;
  video.style.width = videoWidth + "px";
  video.style.height = videoWidth * radio + "px";
  canvasElement.style.width = videoWidth + "px";
  canvasElement.style.height = videoWidth * radio + "px";
  canvasElement.width = video.videoWidth;
  canvasElement.height = video.videoHeight;
  
  if (runningMode === "IMAGE") {
    runningMode = "VIDEO";
    await faceLandmarker.setOptions({ runningMode: runningMode });
  }
  let startTimeMs = performance.now();
  if (lastVideoTime !== video.currentTime) {
    lastVideoTime = video.currentTime;
    results = faceLandmarker.detectForVideo(video, startTimeMs);
  }
  if (results.faceLandmarks) {
    for (const landmarks of results.faceLandmarks) {
      drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS, { color: "#FF3030" });
      drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS, { color: "#30FF30" });
    }
  }
  drawBlendShapes(videoBlendShapes, results.faceBlendshapes);

  
  if (webcamRunning === true) {

    window.requestAnimationFrame(predictWebcam);
  }
}
function drawBlendShapes(el, blendShapes) {
  
  if (!blendShapes.length) {
    return;
  }

  let htmlMaker = "";

  htmlMaker += `
      <li class="blend-shapes-item">
        <span class="blend-shapes-label">${blendShapes[0].categories[10].displayName || blendShapes[0].categories[10].categoryName}</span>
        <span class="blend-shapes-value" style="width: calc(${+blendShapes[0].categories[10].score * 100}% - 120px)">${(+blendShapes[0].categories[10].score).toFixed(4)}</span>
      </li>
    `;
  htmlMaker += `
    <li class="blend-shapes-item">
      <span class="blend-shapes-label">${blendShapes[0].categories[11].displayName || blendShapes[0].categories[11].categoryName}</span>
      <span class="blend-shapes-value" style="width: calc(${+blendShapes[0].categories[11].score * 100}% - 120px)">${(+blendShapes[0].categories[11].score).toFixed(4)}</span>
    </li>
  `;
  htmlMaker += `
  <li class="blend-shapes-item">
    <span class="blend-shapes-label">${blendShapes[0].categories[13].displayName || blendShapes[0].categories[13].categoryName}</span>
    <span class="blend-shapes-value" style="width: calc(${+blendShapes[0].categories[13].score * 100}% - 120px)">${(+blendShapes[0].categories[13].score).toFixed(4)}</span>
  </li>
`;
  htmlMaker += `
<li class="blend-shapes-item">
  <span class="blend-shapes-label">${blendShapes[0].categories[14].displayName || blendShapes[0].categories[14].categoryName}</span>
  <span class="blend-shapes-value" style="width: calc(${+blendShapes[0].categories[14].score * 100}% - 120px)">${(+blendShapes[0].categories[14].score).toFixed(4)}</span>
</li>
`;

  htmlMaker += `
<li class="blend-shapes-item">
  <span class="blend-shapes-label">${blendShapes[0].categories[18].displayName || blendShapes[0].categories[18].categoryName}</span>
  <span class="blend-shapes-value" style="width: calc(${+blendShapes[0].categories[18].score * 100}% - 120px)">${(+blendShapes[0].categories[18].score).toFixed(4)}</span>
</li>
`;

  el.innerHTML = htmlMaker;

}































var index = 0;
var enabled = 1;

setInterval(decide, 1000);
function decide() {

  var objarr = document.getElementsByClassName("card");
  var listarr = document.getElementsByClassName("blend-shapes-label");
  var scorearr = document.getElementsByClassName("blend-shapes-value");


  for (let i = 0; i < listarr.length; i++) {
    if (parseFloat(scorearr[i].textContent) >= 0.5) {
      if (listarr[i].textContent == "eyeLookDownLeft") {
        if (enabled == 1) {
          enabled = 0;
          console.log(enabled);
          document.body.style.backgroundColor = "red";
        }
        else if (enabled == 0) {
          enabled = 1;
          console.log(enabled);
          document.body.style.backgroundColor = "#537FE7";
        }
      }
      if (listarr[i].textContent == "eyeLookInLeft" && enabled == 1 && index < objarr.length - 1) {

        objarr[index].style.border = "none";
        index += 1;
        objarr[index].style.border = "10px solid #525FE1";
        navigator.vibrate(100);
        objarr[index].scrollIntoView({ behavior: "smooth" });

      }
      if (listarr[i].textContent == "eyeLookInRight" && enabled == 1 && index > 0) {
        objarr[index].style.border = "none";
        index -= 1;
        objarr[index].style.border = "10px solid #525FE1";
        navigator.vibrate(100);
        objarr[index].scrollIntoView({ behavior: "smooth" });

      }
      if (listarr[i].textContent == "eyeLookUpRight" && enabled == 1) {
        var name = objarr[index].getAttribute("objname");
        var idd = objarr[index].getAttribute("objid");
        var type = objarr[index].getAttribute("objtype");

        if (type == "category") {
          window.location.href = '/things?name=' + name
        }
        if (type == "thing") {
          fetch("https://final.syntheyesis.repl.co/api/updaterequest?newId=" + idd);
          location.reload();
        }
        if (type == "back") {
          history.back();
        }
        if (type == "home") {
          window.location.href = 'https://final.syntheyesis.repl.co/';
        }
        if (type == "keyboard") {
          window.location.href = 'https://boardsyn.netlify.com/';
        }
      }
    }
  }






  return;
}

setInterval(clickit, 1000);
var clicked = 0;
function clickit() {
  if (faceLandmarker && clicked == 0) {
    document.getElementById("webcamButton").click();
    console.log("clicked");
    clicked = 1;

  }
}
document.addEventListener("DOMContentLoaded", function() {
  if (window.location.href == "https://final.syntheyesis.repl.co/") {
    const popupOverlay = document.getElementById("popupOverlay");
    const closeButton = document.getElementById("closeButton");
    const prevButton = document.getElementById("prevButton");
    const nextButton = document.getElementById("nextButton");
    const slides = document.querySelectorAll(".slide");
    let currentSlideIndex = 0;

    function showSlide(index) {
      slides.forEach((slide, i) => {
        if (i === index) {
          slide.style.display = "block";
        } else {
          slide.style.display = "none";
        }
      });
    }

    closeButton.addEventListener("click", function() {
      popupOverlay.style.display = "none";
      setInterval(clickit, 1000);
    });

    prevButton.addEventListener("click", function() {
      currentSlideIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
      showSlide(currentSlideIndex);
    });

    nextButton.addEventListener("click", function() {
      currentSlideIndex = (currentSlideIndex + 1) % slides.length;
      showSlide(currentSlideIndex);
    });

    showSlide(currentSlideIndex);

    popupOverlay.style.display = "block";
  }
  else {
    popupOverlay.style.display = "none";
    setInterval(clickit, 1000);
  }
});
