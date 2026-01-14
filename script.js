/* ---------------- DOM refs ---------------- */
const form = document.getElementById("checkForm");
const wsMap = document.getElementById("windscreen-map");
const wsLayer = document.getElementById("ws-layer");
const wsPopup = document.getElementById("ws-popup");
const wsButtons = wsPopup.querySelectorAll(".ws-btn");
 
/* ---------------- State ---------------- */
const wsMarks = [];
let pendingClick = null;
let popupOpen = false;
let allowPopupClick = false;
let qrURL = "";
let wakeLock = null;
 
/* ---------------- Prevent form reload ---------------- */
form.addEventListener("submit", e => {
  e.preventDefault();
  generate();
});
 
/* ---------------- Windscreen mapping ---------------- */
wsMap.addEventListener("pointerdown", e => {
  if (popupOpen) return;
 
  const rect = wsMap.getBoundingClientRect();
  pendingClick = {
    x: ((e.clientX - rect.left) / rect.width) * 100,
    y: ((e.clientY - rect.top) / rect.height) * 100
  };
 
  popupOpen = true;
  allowPopupClick = false;
  wsPopup.style.display = "flex";
  document.body.style.overflow = "hidden";
 
  setTimeout(() => allowPopupClick = true, 120);
});
 
wsPopup.addEventListener("click", () => {
  if (!allowPopupClick) return;
  closePopup();
});
 
wsButtons.forEach(btn => {
  btn.addEventListener("click", e => {
    e.stopPropagation();
    if (!allowPopupClick) return;
 
    const type = btn.dataset.type;
    if (type === "cancel") {
      closePopup();
      return;
    }
 
    const mark = {
      x: Math.round(pendingClick.x),
      y: Math.round(pendingClick.y),
      t: type
    };
 
    wsMarks.push(mark);
    renderWsMarker(mark);
    closePopup();
  });
});
 
function closePopup() {
  wsPopup.style.display = "none";
  popupOpen = false;
  allowPopupClick = false;
  pendingClick = null;
  document.body.style.overflow = "";
}
 
function renderWsMarker(m) {
  const el = document.createElement("div");
  el.className = `ws-marker ws-${m.t}`;
  el.style.left = m.x + "%";
  el.style.top = m.y + "%";
  wsLayer.appendChild(el);
}
 
/* ---------------- QR generation ---------------- */
async function requestWakeLock() {
  try { wakeLock = await navigator.wakeLock.request("screen"); } catch {}
}
 
function generate() {
  const payload = {
    ts: new Date().toISOString(),
    r: document.getElementById("reg").value.toUpperCase(),
    m: document.getElementById("mot").value,
    ws: wsMarks,
    wp: document.getElementById("wipers").value,
    n: document.getElementById("lightNotes").value
  };
 
  qrURL = "https://ivanmjwarburton.github.io/Car.Check/report.html?d="
        + encodeURIComponent(JSON.stringify(payload));
 
  document.getElementById("qrWrapper").style.display = "block";
 
  const q = document.getElementById("qrcode");
  q.innerHTML = "";
  new QRCode(q, { text: qrURL, width: 180, height: 180 });
}
 
function openFullscreenQR() {
  const big = document.getElementById("qrBig");
  big.innerHTML = "";
  new QRCode(big, { text: qrURL, width: 320, height: 320 });
 
  document.getElementById("qrFullscreen").style.display = "flex";
  document.documentElement.requestFullscreen?.();
  requestWakeLock();
}
 
function closeFullscreenQR() {
  document.exitFullscreen?.();
  document.getElementById("qrFullscreen").style.display = "none";
  wakeLock?.release?.();
}
