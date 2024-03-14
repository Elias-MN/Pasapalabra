let roscoElement = document.getElementById('rosco');
let tiempoElement = document.getElementById('tiempo');
let aciertosElement = document.getElementById('aciertos');
let fallosElement = document.getElementById('fallos');
let respuestaElement = document.getElementById('respuesta');
let botonRespuestaElement = document.getElementById('botonRespuesta');

let letras = ["I", "E", "S", "A", "L", "B", "A", "R", "R", "E", "G", "A", "S"];
//let abecedario = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
let angulo = 360 / letras.length;
let compensacion = 90;
let segundosTotales = 100;
let segundosActuales = segundosTotales;
let tiempo;

function iniciar() {
  pintarRosco();
  iniciarTemporizador();
}

function pintarRosco() {
  for (let i = 0; i < letras.length; i++) {
    let letra = document.createElement('span');
    letra.className = 'letra';
    letra.id = "letra-" + i;
    letra.textContent = letras[i];
    let giro = i * angulo - compensacion;
    let ancho = (roscoElement.offsetWidth / 2) - 18;
    letra.style.transform = 'rotate(' + giro + 'deg) translate(' + ancho + 'px) rotate(' + (-giro) + 'deg)';
    roscoElement.appendChild(letra);
  }
}

function iniciarTemporizador() {
  restarSegundo();
  tiempo = setInterval(() => {
    if (segundosActuales === 0) {
      tiempoElement.innerHTML = "0:00";
      clearInterval(tiempo);
    }
    restarSegundo();
  }, 1000);
}

function restarSegundo() {
  let tiempoFormateado = formatearTiempo(segundosActuales);
  tiempoElement.innerHTML = tiempoFormateado;
  segundosActuales--;
}

function formatearTiempo(segundos) {
  let minutos = Math.floor(segundos / 60);
  let segundosRestantes = segundos % 60;
  if (segundosRestantes < 10) {
    segundosRestantes = '0' + segundosRestantes;
  }
  return minutos + ':' + segundosRestantes;
}

iniciar();
