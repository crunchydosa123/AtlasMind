const totalFrames = 60;
const viewer = document.getElementById("viewer");
const loading = viewer.querySelector(".loading");
let currentFrame = 0;
let isDragging = false;
let startX = 0;
let imagesLoaded = 0;

const images = [];

// Replace with your actual frame URL pattern:
const baseUrl =
  "https://imgd.aeplcdn.com/860x484/cw/360/hyundai/1729/closed-door/0c0a0d/";

for (let i = 1; i <= totalFrames; i++) {
  const img = document.createElement("img");
  img.src = `${baseUrl}${i}.jpg?wm=1&q=75&v=20240417053728`;
  img.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === totalFrames) loading.remove();
  };
  if (i === 1) img.classList.add("active");
  viewer.appendChild(img);
  images.push(img);
}

function updateFrame(index) {
  images[currentFrame].classList.remove("active");
  currentFrame = (index + totalFrames) % totalFrames;
  images[currentFrame].classList.add("active");
}

function onDragMove(x) {
  const dx = x - startX;
  if (Math.abs(dx) > 5) {
    updateFrame(currentFrame + Math.sign(dx));
    startX = x;
  }
}

// Mouse Events
viewer.addEventListener("mousedown", (e) => {
  isDragging = true;
  startX = e.clientX;
  viewer.style.cursor = "grabbing";
});

viewer.addEventListener("mouseup", () => {
  isDragging = false;
  viewer.style.cursor = "grab";
});

viewer.addEventListener("mousemove", (e) => {
  if (isDragging) onDragMove(e.clientX);
});

viewer.addEventListener("mouseleave", () => (isDragging = false));

// Touch Events (for mobile)
viewer.addEventListener("touchstart", (e) => {
  startX = e.touches[0].clientX;
});

viewer.addEventListener("touchmove", (e) => {
  onDragMove(e.touches[0].clientX);
});
