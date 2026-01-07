function generate() {
  reg.value = reg.value.toUpperCase();

  const data = {
    r: reg.value,
    w: windscreen.value,
    wp: wipers.value,
    l: {
      d: { fl:d_fl.value, rl:d_rl.value, br:d_br.value, if:d_if.value, ir:d_ir.value, is:d_is.value },
      p: { fl:p_fl.value, rl:p_rl.value, br:p_br.value, if:p_if.value, ir:p_ir.value, is:p_is.value }
    }
  };

  const encoded = encodeURIComponent(JSON.stringify(data));
  const url = "https://ivanmjwarburton.github.io/Car.Check/report.html?d=" + encoded;

  const qr = document.getElementById("qrcode");
  qr.innerHTML = "";

  new QRCode(qr, {
    text: url,
    width: 180,
    height: 180,
    correctLevel: QRCode.CorrectLevel.M
  });
}
