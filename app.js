const sessions = {
  productivity: [
    {
      title: "Long focus",
      minutes: 45,
      frequency: 40,
      texture: "brown",
      mood: "Deep work",
      description: "A soft 40 Hz focus pulse carried by a warm, low sound bed."
    },
    {
      title: "Short sprint",
      minutes: 15,
      frequency: 32,
      texture: "pink",
      mood: "Fast start",
      description: "A brighter but rounded pulse for a compact push into the first task."
    },
    {
      title: "Quick work",
      minutes: 8,
      frequency: 24,
      texture: "white",
      mood: "Momentum",
      description: "A clean, light pulse when you need movement without abrasive noise."
    },
    {
      title: "Slow work",
      minutes: 30,
      frequency: 18,
      texture: "brown",
      mood: "Gentle pace",
      description: "Lower, softer pulses for days when the goal is simply to keep going."
    }
  ],
  meditation: [
    {
      title: "Breathing settle",
      minutes: 10,
      frequency: 7,
      texture: "brown",
      mood: "Mindfulness",
      description: "A slow theta pulse for simple breath attention and downshifting."
    },
    {
      title: "Body scan",
      minutes: 18,
      frequency: 6,
      texture: "pink",
      mood: "Somatic",
      description: "Slow, even sound for moving attention through the body without rushing."
    },
    {
      title: "Open awareness",
      minutes: 22,
      frequency: 8,
      texture: "brown",
      mood: "Spacious",
      description: "A calm alpha-edge bed for noticing thoughts and sensations as they pass."
    },
    {
      title: "Loving kindness",
      minutes: 12,
      frequency: 10,
      texture: "pink",
      mood: "Warmth",
      description: "A soft, rounded tone for compassion practice and emotional reset."
    }
  ],
  reset: [
    {
      title: "Overwhelm reset",
      minutes: 6,
      frequency: 12,
      texture: "brown",
      mood: "Grounding",
      description: "Low, unobtrusive sound for stepping back from too much input."
    },
    {
      title: "Transition",
      minutes: 5,
      frequency: 20,
      texture: "pink",
      mood: "Switch task",
      description: "A short bridge between meetings, chores, or work modes."
    },
    {
      title: "Evening coast",
      minutes: 20,
      frequency: 5,
      texture: "brown",
      mood: "Wind down",
      description: "Soft low-frequency movement for closing the day without a hard stop."
    },
    {
      title: "Clean slate",
      minutes: 3,
      frequency: 16,
      texture: "white",
      mood: "Refresh",
      description: "A brief, bright wash to clear mental residue before the next thing."
    }
  ],
  nature: [
    {
      title: "Soft rain",
      minutes: 45,
      frequency: 0,
      texture: "rain",
      mood: "Sleep",
      description: "Muted rainfall with a soft room hush and no frequency tone underneath."
    },
    {
      title: "Forest night",
      minutes: 60,
      frequency: 0,
      texture: "forest",
      mood: "Relax",
      description: "Quiet woodland air with distant, softened night texture."
    },
    {
      title: "Ocean drift",
      minutes: 50,
      frequency: 0,
      texture: "ocean",
      mood: "Unwind",
      description: "Slow, rounded wave swells shaped for sleep and decompression."
    },
    {
      title: "Window storm",
      minutes: 35,
      frequency: 0,
      texture: "storm",
      mood: "Cozy",
      description: "A cozy storm bed with softened rain, low wind, and muted rumble."
    },
    {
      title: "Warm wind",
      minutes: 30,
      frequency: 0,
      texture: "wind",
      mood: "Calm",
      description: "Filtered airflow that rises and falls slowly without sharp edges."
    },
    {
      title: "Night garden",
      minutes: 40,
      frequency: 0,
      texture: "night",
      mood: "Still",
      description: "A darker bedtime ambience with hush, soft distance, and space."
    }
  ]
};

const grid = document.querySelector("#session-grid");
const tabs = [...document.querySelectorAll(".tab")];
const playToggle = document.querySelector("#play-toggle");
const playIcon = document.querySelector("#play-icon");
const restartButton = document.querySelector("#restart");
const selectedTitle = document.querySelector("#selected-title");
const selectedDetail = document.querySelector("#selected-detail");
const currentTitle = document.querySelector("#current-title");
const timeRemaining = document.querySelector("#time-remaining");
const volume = document.querySelector("#volume");
const customFrequency = document.querySelector("#custom-frequency");
const frequencyOutput = document.querySelector("#frequency-output");
const textureSelect = document.querySelector("#texture-select");
const customMinutes = document.querySelector("#custom-minutes");
const useCustom = document.querySelector("#use-custom");
const canvas = document.querySelector("#wave-canvas");
const canvasContext = canvas.getContext("2d");

let category = "productivity";
let selected = sessions.productivity[0];
let audioContext;
let masterGain;
let toneOscillator;
let toneGain;
let noiseSource;
let noiseGain;
let filter;
let activeNodes = [];
let timerId;
let remainingSeconds = selected.minutes * 60;
let isPlaying = false;
let wavePhase = 0;

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60).toString();
  const seconds = Math.max(0, totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function sessionDetail(session) {
  if (isNatureSession(session)) {
    return `${session.minutes} min - nature ambience - no Hz tone`;
  }
  const texture = session.texture === "none" ? "pure tone" : `${session.texture} noise`;
  return `${session.minutes} min - ${session.frequency} Hz pulse - ${texture}`;
}

function isNatureSession(session) {
  return ["rain", "forest", "ocean", "storm", "wind", "night"].includes(session.texture);
}

function renderSessions() {
  grid.innerHTML = "";
  sessions[category].forEach((session) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = `session-card${session.title === selected.title ? " is-selected" : ""}`;
    card.innerHTML = `
      <span class="frequency${isNatureSession(session) ? " nature-chip" : ""}">${isNatureSession(session) ? "Nature" : `${session.frequency} Hz`}</span>
      <h3>${session.title}</h3>
      <p>${session.description}</p>
      <span class="meta-row">
        <span>${session.minutes} min</span>
        <span>${session.mood}</span>
        <span>${session.texture}</span>
      </span>
    `;
    card.addEventListener("click", () => selectSession(session));
    grid.appendChild(card);
  });
}

function updateSelectedText() {
  selectedTitle.textContent = selected.title;
  selectedDetail.textContent = sessionDetail(selected);
  currentTitle.textContent = isPlaying ? selected.title : "Choose a session";
  timeRemaining.textContent = formatTime(remainingSeconds);
  canvas.dataset.visual = isNatureSession(selected) ? selected.texture : "hz";
}

function selectSession(session) {
  selected = session;
  remainingSeconds = selected.minutes * 60;
  updateSelectedText();
  renderSessions();
  if (isPlaying) {
    stopSound();
    startSound();
  }
}

function ensureAudio() {
  if (audioContext) return;
  audioContext = new AudioContext();
  masterGain = audioContext.createGain();
  masterGain.gain.value = Number(volume.value) / 100;
  masterGain.connect(audioContext.destination);
}

function makeNoiseBuffer(type) {
  const length = audioContext.sampleRate * 6;
  const buffer = audioContext.createBuffer(1, length, audioContext.sampleRate);
  const data = buffer.getChannelData(0);
  let brown = 0;
  let pink = 0;

  for (let i = 0; i < length; i += 1) {
    const white = Math.random() * 2 - 1;
    if (type === "brown") {
      brown = (brown + 0.018 * white) / 1.018;
      data[i] = Math.tanh(brown * 2.4);
    } else if (type === "pink") {
      pink = 0.985 * pink + 0.015 * white;
      data[i] = Math.tanh((white * 0.18) + (pink * 1.65));
    } else {
      data[i] = white * 0.38;
    }
  }

  return buffer;
}

function stopSound() {
  [toneOscillator, noiseSource, ...activeNodes].forEach((node) => {
    if (!node) return;
    try {
      node.stop();
    } catch {
      // Already stopped.
    }
  });
  toneOscillator = null;
  noiseSource = null;
  activeNodes = [];
}

function startSound() {
  ensureAudio();
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  if (isNatureSession(selected)) {
    startNatureSound(selected.texture);
    return;
  }

  startHzSound(selected);
}

function connectNoiseLayer(type, gainValue, filterType, frequency, q = 0.7) {
  const source = audioContext.createBufferSource();
  const gain = audioContext.createGain();
  const layerFilter = audioContext.createBiquadFilter();
  source.buffer = makeNoiseBuffer(type);
  source.loop = true;
  layerFilter.type = filterType;
  layerFilter.frequency.value = frequency;
  layerFilter.Q.value = q;
  gain.gain.setValueAtTime(0, audioContext.currentTime);
  gain.gain.linearRampToValueAtTime(gainValue, audioContext.currentTime + 1.2);
  source.connect(layerFilter).connect(gain).connect(masterGain);
  source.start();
  activeNodes.push(source);
  return { source, gain, filter: layerFilter };
}

function addPulse(target, low, high, seconds) {
  const lfo = audioContext.createOscillator();
  const lfoGain = audioContext.createGain();
  const midpoint = (high + low) / 2;
  lfo.frequency.value = 1 / seconds;
  lfoGain.gain.value = (high - low) / 2;
  target.gain.cancelScheduledValues(audioContext.currentTime);
  target.gain.setValueAtTime(0, audioContext.currentTime);
  target.gain.linearRampToValueAtTime(midpoint, audioContext.currentTime + 1.2);
  lfo.connect(lfoGain).connect(target.gain);
  lfo.start();
  activeNodes.push(lfo);
}

function addTone(frequency, gainValue, type = "sine") {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0, audioContext.currentTime);
  gain.gain.linearRampToValueAtTime(gainValue, audioContext.currentTime + 1.1);
  oscillator.connect(gain).connect(masterGain);
  oscillator.start();
  activeNodes.push(oscillator);
  return gain;
}

function startHzSound(session) {
  const pulseRate = Math.max(1, Math.min(45, session.frequency));
  const isFocus = pulseRate >= 18;
  const carrierFrequency = isFocus ? 132 : 96;
  const toneLevel = session.texture === "none" ? 0.075 : 0.045;
  const pulseDepth = isFocus ? 0.01 : 0.022;

  const mainTone = addTone(carrierFrequency, toneLevel, "sine");
  const undertone = addTone(carrierFrequency / 2, toneLevel * 0.42, "sine");
  const pulse = audioContext.createOscillator();
  const pulseGain = audioContext.createGain();
  pulse.type = "sine";
  pulse.frequency.value = pulseRate;
  pulseGain.gain.value = pulseDepth;
  pulse.connect(pulseGain).connect(mainTone.gain);
  pulse.connect(pulseGain).connect(undertone.gain);
  pulse.start();
  activeNodes.push(pulse);

  if (session.texture !== "none") {
    const filterFrequency = session.texture === "white" ? 1200 : session.texture === "pink" ? 820 : 460;
    const noiseLevel = session.texture === "white" ? 0.035 : session.texture === "pink" ? 0.06 : 0.08;
    const layer = connectNoiseLayer(session.texture, noiseLevel, "lowpass", filterFrequency, 0.55);
    addPulse(layer.gain, noiseLevel * 0.72, noiseLevel, 18);
  }
}

function startNatureSound(texture) {
  if (texture === "rain") {
    connectNoiseLayer("pink", 0.065, "lowpass", 1450, 0.45);
    connectNoiseLayer("white", 0.022, "bandpass", 1150, 0.6);
    addPulse(connectNoiseLayer("brown", 0.035, "lowpass", 260).gain, 0.02, 0.045, 16);
  }

  if (texture === "forest") {
    connectNoiseLayer("brown", 0.075, "lowpass", 420);
    connectNoiseLayer("pink", 0.025, "bandpass", 980, 0.9);
    [620, 740, 860].forEach((frequency, index) => {
      const gain = addTone(frequency, 0.0025 + index * 0.0008, "sine");
      addPulse(gain, 0.0002, 0.0045, 13 + index * 7);
    });
  }

  if (texture === "ocean") {
    addPulse(connectNoiseLayer("brown", 0.09, "lowpass", 300).gain, 0.025, 0.12, 11);
    addPulse(connectNoiseLayer("pink", 0.042, "bandpass", 560, 0.55).gain, 0.012, 0.06, 15);
  }

  if (texture === "storm") {
    connectNoiseLayer("pink", 0.055, "lowpass", 1050, 0.45);
    addPulse(connectNoiseLayer("brown", 0.085, "lowpass", 210).gain, 0.025, 0.11, 18);
    addPulse(connectNoiseLayer("pink", 0.028, "bandpass", 120, 0.8).gain, 0.006, 0.04, 28);
  }

  if (texture === "wind") {
    addPulse(connectNoiseLayer("pink", 0.07, "bandpass", 420, 0.45).gain, 0.018, 0.095, 15);
    addPulse(connectNoiseLayer("brown", 0.045, "lowpass", 240).gain, 0.012, 0.055, 23);
  }

  if (texture === "night") {
    connectNoiseLayer("brown", 0.07, "lowpass", 340);
    connectNoiseLayer("pink", 0.018, "bandpass", 1280, 1.1);
    [520, 690, 840].forEach((frequency, index) => {
      const gain = addTone(frequency, 0.0018 + index * 0.0006, "sine");
      addPulse(gain, 0.0001, 0.0038, 19 + index * 8);
    });
  }
}

function startTimer() {
  clearInterval(timerId);
  timerId = setInterval(() => {
    remainingSeconds -= 1;
    if (remainingSeconds <= 0) {
      remainingSeconds = 0;
      pause();
    }
    updateSelectedText();
  }, 1000);
}

function play() {
  isPlaying = true;
  playToggle.classList.add("is-playing");
  playToggle.setAttribute("aria-label", "Pause selected session");
  currentTitle.textContent = selected.title;
  startSound();
  startTimer();
}

function pause() {
  isPlaying = false;
  playToggle.classList.remove("is-playing");
  playToggle.setAttribute("aria-label", "Play selected session");
  clearInterval(timerId);
  stopSound();
  updateSelectedText();
}

function drawWave() {
  const width = canvas.width;
  const height = canvas.height;
  canvasContext.clearRect(0, 0, width, height);

  if (isNatureSession(selected)) {
    drawNatureVisual(width, height);
    wavePhase += isPlaying ? 0.018 : 0.006;
    requestAnimationFrame(drawWave);
    return;
  }

  canvasContext.fillStyle = "#0d100f";
  canvasContext.fillRect(0, 0, width, height);

  const lines = [
    { color: "rgba(159, 207, 153, 0.95)", offset: 0, amplitude: isPlaying ? 42 : 18 },
    { color: "rgba(114, 201, 195, 0.68)", offset: 1.8, amplitude: isPlaying ? 28 : 10 },
    { color: "rgba(229, 196, 107, 0.46)", offset: 3.1, amplitude: isPlaying ? 18 : 7 }
  ];

  lines.forEach((line) => {
    canvasContext.beginPath();
    canvasContext.strokeStyle = line.color;
    canvasContext.lineWidth = 3;
    for (let x = 0; x <= width; x += 4) {
      const progress = x / width;
      const frequency = Math.max(2, selected.frequency / 8);
      const y = height / 2
        + Math.sin((progress * frequency) + wavePhase + line.offset) * line.amplitude
        + Math.sin((progress * 11) + wavePhase * 0.55) * 6;
      if (x === 0) {
        canvasContext.moveTo(x, y);
      } else {
        canvasContext.lineTo(x, y);
      }
    }
    canvasContext.stroke();
  });

  wavePhase += isPlaying ? 0.045 : 0.012;
  requestAnimationFrame(drawWave);
}

function drawNatureVisual(width, height) {
  const gradient = canvasContext.createLinearGradient(0, 0, 0, height);
  const visual = selected.texture;
  const motion = isPlaying ? 1 : 0.35;

  if (visual === "rain" || visual === "storm") {
    gradient.addColorStop(0, visual === "storm" ? "#151d24" : "#17242a");
    gradient.addColorStop(1, visual === "storm" ? "#080b0d" : "#0c1415");
    canvasContext.fillStyle = gradient;
    canvasContext.fillRect(0, 0, width, height);

    canvasContext.fillStyle = visual === "storm" ? "rgba(98, 127, 143, 0.16)" : "rgba(114, 154, 163, 0.13)";
    for (let i = 0; i < 72; i += 1) {
      const x = (i * 37 + wavePhase * 120 * motion) % (width + 80) - 40;
      const y = (i * 53 + wavePhase * 260 * motion) % (height + 70) - 35;
      const length = visual === "storm" ? 22 : 15;
      canvasContext.fillRect(x, y, 1.3, length);
    }

    drawSoftHorizon(width, height, visual === "storm" ? "rgba(120, 136, 131, 0.22)" : "rgba(138, 175, 166, 0.2)");
    if (visual === "storm") {
      drawRumble(width, height);
    }
    return;
  }

  if (visual === "ocean") {
    gradient.addColorStop(0, "#122733");
    gradient.addColorStop(1, "#081217");
    canvasContext.fillStyle = gradient;
    canvasContext.fillRect(0, 0, width, height);
    for (let i = 0; i < 5; i += 1) {
      drawSwell(width, height * (0.48 + i * 0.08), 16 + i * 4, i);
    }
    return;
  }

  if (visual === "forest" || visual === "night") {
    gradient.addColorStop(0, visual === "night" ? "#10141f" : "#102016");
    gradient.addColorStop(1, "#070a08");
    canvasContext.fillStyle = gradient;
    canvasContext.fillRect(0, 0, width, height);
    drawTreeLine(width, height, visual === "night");
    drawFireflies(width, height, visual === "night" ? 10 : 7);
    return;
  }

  if (visual === "wind") {
    gradient.addColorStop(0, "#182420");
    gradient.addColorStop(1, "#0a100e");
    canvasContext.fillStyle = gradient;
    canvasContext.fillRect(0, 0, width, height);
    for (let i = 0; i < 8; i += 1) {
      drawWindLine(width, height * (0.2 + i * 0.085), i);
    }
  }
}

function drawSoftHorizon(width, height, color) {
  canvasContext.strokeStyle = color;
  canvasContext.lineWidth = 4;
  canvasContext.beginPath();
  for (let x = 0; x <= width; x += 8) {
    const y = height * 0.72 + Math.sin(x / 48 + wavePhase) * 8;
    if (x === 0) {
      canvasContext.moveTo(x, y);
    } else {
      canvasContext.lineTo(x, y);
    }
  }
  canvasContext.stroke();
}

function drawRumble(width, height) {
  const pulse = 0.08 + Math.max(0, Math.sin(wavePhase * 0.6)) * 0.08;
  canvasContext.fillStyle = `rgba(185, 195, 183, ${pulse})`;
  canvasContext.fillRect(0, height * 0.72, width, height * 0.28);
}

function drawSwell(width, yBase, amplitude, offset) {
  canvasContext.strokeStyle = `rgba(148, 192, 184, ${0.16 + offset * 0.025})`;
  canvasContext.lineWidth = 5 - offset * 0.35;
  canvasContext.beginPath();
  for (let x = -20; x <= width + 20; x += 8) {
    const y = yBase + Math.sin((x / 58) + wavePhase * (0.8 + offset * 0.08)) * amplitude;
    if (x === -20) {
      canvasContext.moveTo(x, y);
    } else {
      canvasContext.lineTo(x, y);
    }
  }
  canvasContext.stroke();
}

function drawTreeLine(width, height, isNight) {
  canvasContext.fillStyle = isNight ? "rgba(8, 15, 13, 0.9)" : "rgba(8, 20, 12, 0.88)";
  for (let x = -20; x < width + 40; x += 24) {
    const treeHeight = 58 + Math.sin(x * 0.08) * 22;
    canvasContext.beginPath();
    canvasContext.moveTo(x, height);
    canvasContext.lineTo(x + 14, height - treeHeight);
    canvasContext.lineTo(x + 30, height);
    canvasContext.closePath();
    canvasContext.fill();
  }
}

function drawFireflies(width, height, count) {
  for (let i = 0; i < count; i += 1) {
    const x = (width * ((i * 0.23) % 1) + Math.sin(wavePhase + i) * 14) % width;
    const y = height * (0.26 + ((i * 0.17) % 0.42)) + Math.cos(wavePhase * 0.7 + i) * 8;
    const glow = 0.12 + Math.max(0, Math.sin(wavePhase * 1.4 + i)) * 0.18;
    canvasContext.fillStyle = `rgba(229, 196, 107, ${glow})`;
    canvasContext.beginPath();
    canvasContext.arc(x, y, 2.5, 0, Math.PI * 2);
    canvasContext.fill();
  }
}

function drawWindLine(width, yBase, offset) {
  canvasContext.strokeStyle = `rgba(184, 205, 181, ${0.08 + offset * 0.012})`;
  canvasContext.lineWidth = 2;
  canvasContext.beginPath();
  for (let x = -40; x <= width + 40; x += 10) {
    const y = yBase + Math.sin((x / 62) + wavePhase * 1.5 + offset) * 12;
    if (x === -40) {
      canvasContext.moveTo(x, y);
    } else {
      canvasContext.lineTo(x, y);
    }
  }
  canvasContext.stroke();
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    category = tab.dataset.category;
    tabs.forEach((item) => item.classList.toggle("is-active", item === tab));
    if (!sessions[category].includes(selected)) {
      selectSession(sessions[category][0]);
    } else {
      renderSessions();
    }
  });
});

playToggle.addEventListener("click", () => {
  if (isPlaying) {
    pause();
  } else {
    play();
  }
});

restartButton.addEventListener("click", () => {
  remainingSeconds = selected.minutes * 60;
  updateSelectedText();
  if (isPlaying) {
    clearInterval(timerId);
    startTimer();
  }
});

volume.addEventListener("input", () => {
  if (masterGain) {
    masterGain.gain.value = Number(volume.value) / 100;
  }
});

customFrequency.addEventListener("input", () => {
  frequencyOutput.textContent = `${customFrequency.value} Hz`;
});

useCustom.addEventListener("click", () => {
  const minutes = Math.max(1, Math.min(180, Number(customMinutes.value) || 25));
  selectSession({
    title: "Custom session",
    minutes,
    frequency: Number(customFrequency.value),
    texture: textureSelect.value,
    mood: "Custom",
    description: "Your own frequency, texture, and session length."
  });
});

renderSessions();
updateSelectedText();
drawWave();
