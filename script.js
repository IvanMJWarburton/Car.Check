// Prevent form from submitting
document.getElementById("checkForm").addEventListener("submit", e => {
  e.preventDefault();
  generateQRCode();
});

// Windscreen marker setup
const wsMap = document.getElementById("windscreen-map");
const wsLayer = document.getElementById("ws-layer");
const wsPopup = document.getElementById("ws-popup");
const wsButtons = wsPopup.querySelectorAll(".ws-btn");
let wsMarks = [];
let pendingClick = null;

wsMap.addEventListener("pointerdown", e => {
  const rect = wsMap.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;
  pendingClick = { x, y };

  wsPopup.style.display = "flex";
});

wsButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const type = btn.classList.contains("chip") ? "chip"
               : btn.classList.contains("crack") ? "crack"
               : "cancel";

    wsPopup.style.display = "none";

    if (type === "cancel" || !pendingClick) {
      pendingClick = null;
      return;
    }

    const mark = { ...pendingClick, t: type };
    wsMarks.push(mark);
    renderMarker(mark);
    pendingClick = null;
  });
});

function renderMarker(m) {
  const el = document.createElement("div");
  el.className = `ws-marker ws-${m.t}`;
  el.style.left = m.x + "%";
  el.style.top = m.y + "%";
  wsLayer.appendChild(el);
}

// QR code generation
function generateQRCode() {
  const reg = document.getElementById("reg").value.toUpperCase();
  const mot = document.getElementById("mot").value;
  const lights = document.getElementById("lights").value;
  const wipers = document.getElementById("wipers").value;
  const notes = document.getElementById("notes").value;

  const data = {
    ts: new Date().toISOString(),
    r: reg,
    m: mot,
    l: lights,
    wp: wipers,
    n: notes,
    ws: wsMarks
  };

  const url = "https://ivanmjwarburton.github.io/Car.Check/report.html?d=" + encodeURIComponent(JSON.stringify(data));

  const qrDiv = document.getElementById("qrcode");
  qrDiv.innerHTML = "";
  new QRCode(qrDiv, {
    text: url,
    width: 180,
    height: 180,
    correctLevel: QRCode.CorrectLevel.M
  });
}
