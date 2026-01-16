document.addEventListener("DOMContentLoaded", () => {
  const reportContainer = document.getElementById("report");
  const raw = new URLSearchParams(window.location.search).get("d");

  function badge(text, cls) {
    return `<span class="badge ${cls}">${text}</span>`;
  }

  function motStatus(dateStr) {
    if (!dateStr) return { text: "Not recorded", cls: "warn", illegal: false, date: null };

    const today = new Date();
    const mot = new Date(dateStr);
    const days = Math.ceil((mot - today) / 86400000);

    const formatted = mot.toLocaleDateString(undefined, {
      day: "numeric",
      month: "long",
      year: "numeric"
    });

    if (days < 0) {
      return {
        text: `Expired ${Math.abs(days)} days ago`,
        cls: "bad",
        illegal: true,
        date: formatted
      };
    }

    if (days <= 30) {
      return {
        text: `Expires in ${days} days`,
        cls: "warn",
        illegal: false,
        date: formatted
      };
    }

    return {
      text: `Expires in ${days} days`,
      cls: "good",
      illegal: false,
      date: formatted
    };
  }

  function tyreReport(mm) {
    if (mm == null) return { text: "Not checked", cls: "warn", issue: false, illegal: false };
    if (mm < 1.6) return { text: `${mm} mm – Illegal`, cls: "bad", issue: true, illegal: true };
    if (mm < 3) return { text: `${mm} mm – Low`, cls: "warn", issue: true, illegal: false };
    return { text: `${mm} mm – Good`, cls: "good", issue: false, illegal: false };
  }

  if (!raw) {
    reportContainer.innerHTML = "<p>No report data.</p>";
    return;
  }

  let d;
  try {
    d = JSON.parse(decodeURIComponent(raw));
  } catch {
    reportContainer.innerHTML = "<p>Invalid report data.</p>";
    return;
  }

  const checkTime = d.ts ? new Date(d.ts).toLocaleString() : "Not recorded";

  let issues = 0;
  let illegal = false;

  const mot = motStatus(d.m);
  if (mot.illegal) illegal = true;

  if (d.wp === "I") issues++;
  if (d.ws && d.ws.length) issues += d.ws.length;

  const tyres = {
    df: tyreReport(d.t?.df),
    dr: tyreReport(d.t?.dr),
    pf: tyreReport(d.t?.pf),
    pr: tyreReport(d.t?.pr)
  };

  Object.values(tyres).forEach(t => {
    if (t.issue) issues++;
    if (t.illegal) illegal = true;
  });

  function light(v) {
    if (v === "I") {
      issues++;
      return badge("Issue observed", "warn");
    }
    return badge("No issues found", "good");
  }

  let overallStatus = "";
  let overallDesc = "";

  if (illegal) {
    overallStatus = `<div class="overall-status badge bad">Vehicle Illegal</div>`;
    overallDesc = `<div class="overall-desc">A serious issue was found. The vehicle is not road‑legal and needs immediate attention.</div>`;
  } else if (issues > 0) {
    overallStatus = `<div class="overall-status badge warn">Issues Found</div>`;
    overallDesc = `<div class="overall-desc">Some issues were found that are not illegal but should be inspected soon.</div>`;
  } else {
    overallStatus = `<div class="overall-status badge good">All Good</div>`;
    overallDesc = `<div class="overall-desc">All is OK — no issues found. Vehicle is in optimal condition.</div>`;
  }

  // ---------------------------------------------------------
  // INSERT BUTTONS AT TOP OF REPORT
  // ---------------------------------------------------------

  reportContainer.innerHTML = `
    <div class="report-actions">
      <button id="downloadPdfBtn" class="action-btn">Download PDF</button>
    </div>

    <p><strong>Date & Time of Check:</strong> ${checkTime}</p>

    ${overallStatus}
    ${overallDesc}

    <h3>Vehicle Details</h3>
    <p><strong>Registration:</strong> ${d.r || "Not recorded"}</p>

    <p class="overall-desc">This date is provided for reference only. This check does not confirm MOT eligibility or roadworthiness.</p>

    <p><strong>MOT:</strong> 
      ${badge(mot.text, mot.cls)}
      ${mot.date ? `<br>Expiry date: ${mot.date}` : ""}
    </p>

    <h3>Windscreen & Wipers</h3>

    <p class="overall-desc">Chips, cracks, or damage in the driver’s line of sight may result in an MOT failure. This is a visual check only.</p>

    <div id="windscreen-map">
      <img src="windscreen.jpg" alt="Windscreen">
      <div id="ws-layer"></div>
    </div>

    <div class="legend">
      <span class="legend-dot legend-chip"></span> Chip
      <span class="legend-dot legend-crack"></span> Crack
    </div>

    <p>Windscreen: ${
      d.ws && d.ws.length
        ? badge("Damage recorded", "warn")
        : badge("No issues found", "good")
    }
    </p>

    <p>Wipers: ${
      d.wp === "W"
        ? badge("No issues found", "good")
        : badge("Worn / damaged", "warn")
    }</p>

    <h3>Tyres</h3>

    <p class="overall-desc">
      The legal minimum tread depth is 1.6mm across the central ¾ of the tyre. 
      This is a visual check only.
    </p>

    <ul>
      <li>Driver Front: ${badge(tyres.df.text, tyres.df.cls)}</li>
      <li>Driver Rear: ${badge(tyres.dr.text, tyres.dr.cls)}</li>
      <li>Passenger Front: ${badge(tyres.pf.text, tyres.pf.cls)}</li>
      <li>Passenger Rear: ${badge(tyres.pr.text, tyres.pr.cls)}</li>
    </ul>

    <h3>Lights</h3>

    <p class="overall-desc">
      All required lights must operate correctly for an MOT. 
      This check is visual only and does not guarantee MOT compliance.
    </p>

    <h3>Driver Side</h3>
    <ul>
      <li>Front Light: ${light(d.l?.d?.fl)}</li>
      <li>Rear Light: ${light(d.l?.d?.rl)}</li>
      <li>Brake Light: ${light(d.l?.d?.br)}</li>
      <li>Front Indicator: ${light(d.l?.d?.if)}</li>
      <li>Rear Indicator: ${light(d.l?.d?.ir)}</li>
      <li>Side Repeater: ${light(d.l?.d?.is)}</li>
    </ul>

    <h3>Passenger Side</h3>
    <ul>
      <li>Front Light: ${light(d.l?.p?.fl)}</li>
      <li>Rear Light: ${light(d.l?.p?.rl)}</li>
      <li>Brake Light: ${light(d.l?.p?.br)}</li>
      <li>Front Indicator: ${light(d.l?.p?.if)}</li>
      <li>Rear Indicator: ${light(d.l?.p?.ir)}</li>
      <li>Side Repeater: ${light(d.l?.p?.is)}</li>
    </ul>

    ${
      d.n
        ? `<h3>Additional Notes</h3><p>${String(d.n).replace(/\n/g, "<br>")}</p>`
        : ""
    }
  `;

  // ---------------------------------------------------------
  // PDF DOWNLOAD HANDLER
  // ---------------------------------------------------------

  document.getElementById("downloadPdfBtn").addEventListener("click", () => {
    const element = document.getElementById("report");

    const opt = {
      margin: 10,
      filename: `${d.r || "vehicle"}-health-check.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    };

    html2pdf().from(element).set(opt).save();
  });

  // ---------------------------------------------------------
  // WINDSCREEN MARKERS
  // ---------------------------------------------------------

  const wsLayer = document.getElementById("ws-layer");
  if (d.ws && d.ws.length) {
    d.ws.forEach(m => {
      const el = document.createElement("div");
      el.className = `ws-marker ws-${m.t}`;
      el.style.left = m.x + "%";
      el.style.top = m.y + "%";
      wsLayer.appendChild(el);
    });
  }
});
