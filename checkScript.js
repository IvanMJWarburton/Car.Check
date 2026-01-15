document.addEventListener("DOMContentLoaded", () => {
  let qrURL = "";
  let wakeLock = null;

  const wsMarks = [];

  const wsMap = document.getElementById("windscreen-map");
  const wsLayer = document.getElementById("ws-layer");

  const wsPopup = document.getElementById("ws-popup");
  const wsDialog = document.getElementById("wsDialog");
  const wsChipBtn = document.getElementById("wsChipBtn");
  const wsCrackBtn = document.getElementById("wsCrackBtn");
  const wsCancelBtn = document.getElementById("wsCancelBtn");

  const clearMarksBtn = document.getElementById("clearMarksBtn");
  const undoMarkBtn = document.getElementById("undoMarkBtn");

  const regInput = document.getElementById("reg");
  const motInput = document.getElementById("mot");
  const wipersSelect = document.getElementById("wipers");
  const lightNotes = document.getElementById("lightNotes");

  const td_df = document.getElementById("td_df");
  const td_dr = document.getElementById("td_dr");
  const td_pf = document.getElementById("td_pf");
  const td_pr = document.getElementById("td_pr");

  const d_fl = document.getElementById("d_fl");
  const d_rl = document.getElementById("d_rl");
  const d_br = document.getElementById("d_br");
  const d_if = document.getElementById("d_if");
  const d_ir = document.getElementById("d_ir");
  const d_is = document.getElementById("d_is");

  const p_fl = document.getElementById("p_fl");
  const p_rl = document.getElementById("p_rl");
  const p_br = document.getElementById("p_br");
  const p_if = document.getElementById("p_if");
  const p_ir = document.getElementById("p_ir");
  const p_is = document.getElementById("p_is");

  const generateBtn = document.getElementById("generateBtn");
  const qrWrapper = document.getElementById("qrWrapper");
  const qrcodeContainer = document.getElementById("qrcode");
  const qrFullscreen = document.getElementById("qrFullscreen");
  const qrBig = document.getElementById("qrBig");

  let pendingClick = null;
  let popupOpen = false;
  let allowPopupClick = false;

  document.getElementById("motQuickCheckBtn").addEventListener("click", () => {
  const reg = document.getElementById("reg").value.trim();

  if (!reg) {
    alert("Enter a registration first.");
    return;
  }

  const url = "https://www.check-mot.service.gov.uk/results?registration=" + encodeURIComponent(reg);

  window.open(url, "_blank");
});


  // ---------------- Windscreen Mapping ----------------

  function openPopupAtClick(e) {
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

    setTimeout(() => allowPopupClick = true, 200);
  }

  function closePopup() {
    wsPopup.style.display = "none";
    popupOpen = false;
    allowPopupClick = false;
    pendingClick = null;
    document.body.style.overflow = "";
  }

  function selectWsType(type) {
    if (!allowPopupClick) return;

    if (type === "cancel" || !pendingClick) {
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
  }

  function renderWsMarker(m) {
    const el = document.createElement("div");
    el.className = `ws-marker ws-${m.t}`;
    el.style.left = m.x + "%";
    el.style.top = m.y + "%";
    wsLayer.appendChild(el);
  }

  // ---------------- Undo & Clear ----------------

  function clearMarks() {
    wsMarks.length = 0;
    wsLayer.innerHTML = "";
  }

  function undoLastMark() {
    if (wsMarks.length === 0) return;
    wsMarks.pop();
    wsLayer.removeChild(wsLayer.lastElementChild);
  }

  // ---------------- QR Logic ----------------

  async function requestWakeLock() {
    try {
      if ("wakeLock" in navigator) {
        wakeLock = await navigator.wakeLock.request("screen");
      }
    } catch {}
  }

  function buildDataPayload() {
    return {
      ts: new Date().toISOString(),
      r: regInput.value,
      m: motInput.value,
      ws: wsMarks,
      wp: wipersSelect.value,
      n: lightNotes.value,
      t: {
        df: +td_df.value || null,
        dr: +td_dr.value || null,
        pf: +td_pf.value || null,
        pr: +td_pr.value || null
      },
      l: {
        d: {
          fl: d_fl.value,
          rl: d_rl.value,
          br: d_br.value,
          if: d_if.value,
          ir: d_ir.value,
          is: d_is.value
        },
        p: {
          fl: p_fl.value,
          rl: p_rl.value,
          br: p_br.value,
          if: p_if.value,
          ir: p_ir.value,
          is: p_is.value
        }
      }
    };
  }

  function generateQR() {
    regInput.value = regInput.value.toUpperCase();

    const data = buildDataPayload();
    qrURL =
      "https://ivanmjwarburton.github.io/Car.Check/report.html?d=" +
      encodeURIComponent(JSON.stringify(data));

    qrWrapper.style.display = "block";
    qrcodeContainer.innerHTML = "";

    new QRCode(qrcodeContainer, {
      text: qrURL,
      width: 180,
      height: 180,
      correctLevel: QRCode.CorrectLevel.M
    });
  }

  function openFullscreenQR() {
    if (!qrURL) return;

    qrBig.innerHTML = "";
    new QRCode(qrBig, { text: qrURL, width: 320, height: 320 });
    qrFullscreen.style.display = "flex";

    document.documentElement.requestFullscreen?.();
    requestWakeLock();
  }

  function closeFullscreenQR() {
    document.exitFullscreen?.();
    qrFullscreen.style.display = "none";
    wakeLock?.release?.();
  }

  // ---------------- Event Bindings ----------------

  wsMap.addEventListener("pointerdown", openPopupAtClick);

  wsPopup.addEventListener("click", () => {
    if (!allowPopupClick) return;
    closePopup();
  });

  wsDialog.addEventListener("click", e => e.stopPropagation());

  wsChipBtn.addEventListener("click", () => selectWsType("chip"));
  wsCrackBtn.addEventListener("click", () => selectWsType("crack"));
  wsCancelBtn.addEventListener("click", () => selectWsType("cancel"));

  clearMarksBtn.addEventListener("click", clearMarks);
  undoMarkBtn.addEventListener("click", undoLastMark);

  generateBtn.addEventListener("click", generateQR);
  qrcodeContainer.addEventListener("click", openFullscreenQR);
  qrFullscreen.addEventListener("click", closeFullscreenQR);
});
