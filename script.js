const slides = [...document.querySelectorAll(".slide")];
const navButtons = [...document.querySelectorAll(".nav-index")];
const startButton = document.getElementById("startButton");
const resetButton = document.getElementById("resetButton");
const slideCounter = document.getElementById("slideCounter");
const statusLabel = document.getElementById("statusLabel");
const countdownTimer = document.getElementById("countdownTimer");
const goToButtons = [...document.querySelectorAll("[data-go-to]")];

const slideDurationMs = 15000;
let currentSlide = 0;
let isPlaying = false;
let autoplayTimeout = null;
let countdownInterval = null;
let slideDeadline = null;
let remainingMs = slideDurationMs;

const pad = (value) => String(value).padStart(2, "0");

function formatTime(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${pad(minutes)}:${pad(seconds)}`;
}

function updateCounter() {
  slideCounter.textContent = `${pad(currentSlide + 1)} / ${pad(slides.length)}`;
  statusLabel.textContent = slides[currentSlide].dataset.status ?? "";
}

function updateCountdownDisplay() {
  countdownTimer.textContent = formatTime(remainingMs);
}

function scheduleNextSlide() {
  clearTimeout(autoplayTimeout);
  clearInterval(countdownInterval);

  slideDeadline = Date.now() + slideDurationMs;
  remainingMs = slideDurationMs;
  updateCountdownDisplay();

  countdownInterval = setInterval(() => {
    remainingMs = Math.max(0, slideDeadline - Date.now());
    updateCountdownDisplay();
  }, 250);

  autoplayTimeout = setTimeout(() => {
    showSlide(currentSlide + 1, false);
  }, slideDurationMs);
}

function showSlide(index, resetToFull = true) {
  currentSlide = (index + slides.length) % slides.length;

  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle("is-active", slideIndex === currentSlide);
  });

  navButtons.forEach((button, buttonIndex) => {
    button.classList.toggle("is-active", buttonIndex === currentSlide);
  });

  updateCounter();

  if (isPlaying) {
    scheduleNextSlide();
  } else if (resetToFull) {
    remainingMs = slideDurationMs;
    updateCountdownDisplay();
  }
}

function clearAutoplay() {
  if (autoplayTimeout) {
    clearTimeout(autoplayTimeout);
    autoplayTimeout = null;
  }

  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
}

function startAutoplay() {
  clearAutoplay();
  isPlaying = true;
  startButton.textContent = "Pausar";
  scheduleNextSlide();
}

function stopAutoplay() {
  if (slideDeadline) {
    remainingMs = Math.max(0, slideDeadline - Date.now());
  }
  clearAutoplay();
  isPlaying = false;
  slideDeadline = null;
  startButton.textContent = "Iniciar";
  updateCountdownDisplay();
}

function toggleAutoplay() {
  if (isPlaying) {
    stopAutoplay();
  } else {
    startAutoplay();
  }
}

function restartPresentation() {
  showSlide(0, true);
  startAutoplay();
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showSlide(Number(button.dataset.index));
  });
});

goToButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showSlide(Number(button.dataset.goTo));
  });
});

startButton.addEventListener("click", toggleAutoplay);
resetButton.addEventListener("click", restartPresentation);

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") {
    showSlide(currentSlide + 1);
  }

  if (event.key === "ArrowLeft") {
    showSlide(currentSlide - 1);
  }

  if (event.key === " ") {
    event.preventDefault();
    toggleAutoplay();
  }
});

showSlide(0);
updateCountdownDisplay();
