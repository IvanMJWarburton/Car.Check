function treadStatus(mm) {
  if (mm === "" || mm === null) return "Not checked";
  if (mm < 1.6) return "Illegal (below 1.6mm)";
  if (mm < 3) return "Low tread";
  return "Good tread";
}

function generate() {
  const data = {
    reg: reg.value,
    windscreen: windscreen.value,
    wipers: wipers.value,
    lights: {
      driver: {
        front: light_fr.value,
        rear: light_rr.value,
        brake: brake_r.value,
        indicators: {
          front: ind_rf.value,
          rear: ind_rr.value,
          side: ind_rs.value
        }
      },
      passenger: {
        front: light_fl.value,
        rear: light_rl.value,
        brake: brake_l.value,
        indicators: {
          front: ind_lf.value,
          rear: ind_lr.value,
          side: ind_ls.value
        }
      }
    },
    tread: {
      driver: {
        front: treadStatus(td_fl.value),
        rear: treadStatus(td_rl.value)
      },
      passenger: {
        front: treadStatus(td_fr.value),
        rear: treadStatus(td_rr.value)
      }
    },
    notes: notes.value,
    advisory: "Visual check only. Not an MOT or safety guarantee."
  };

  const encoded = encodeURIComponent(JSON.stringify(data));
  const url = "https://ivanmjwarburton.github.io/Car.Check/report.html?data=" + encoded;

  const qr = document.getElementById("qrcode");
  qr.innerHTML = "";

  new QRCode(qr, {
    text: url,
    width: 200,
    height: 200,
    correctLevel: QRCode.CorrectLevel.M
  });
}
