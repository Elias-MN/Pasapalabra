//Elementos menú inicial
let inicioElement = document.getElementById('inicio');
let botonComenzarElement = document.getElementById('botonComenzar');
let concursanteElement = document.getElementById('concursante');

//Elementos juego
let juegoElement = document.getElementById('juego');
let roscoElement = document.getElementById('rosco');
let preguntaElement = document.getElementById('texto-pregunta');
let letraElement = document.getElementById('letra-pregunta');
let tiempoElement = document.getElementById('tiempo');
let aciertosElement = document.getElementById('aciertos');
let fallosElement = document.getElementById('fallos');
let respuestaElement = document.getElementById('respuesta');
let botonRespuestaElement = document.getElementById('botonRespuesta');
let respuestaCorrectaAudio = document.getElementById('correctoAudio');
let respuestaIncorrectaAudio = document.getElementById('incorrectoAudio');

//Elementos menú reiniciar
let finalElement = document.getElementById('final');
let botonReiniciarElement = document.getElementById('botonReiniciar');
let aciertosFinalesElement = document.getElementById('aciertosFinales');
let fallosFinalesElement = document.getElementById('fallosFinales');

let json;
let letras;
let angulo;
let compensacion = 90;
let segundosTotales;
let segundosActuales;
let tiempoInvervalo;
let concursante;
let aciertos;
let fallos;
let idPreguntaActual;


function iniciar() {
  concursanteElement.value = "";
  aciertos = 0;
  fallos = 0;
  idPreguntaActual = 0;
  segundosTotales = 120;
  segundosActuales = segundosTotales;

  let letrasElement = document.querySelectorAll('.letra');
  for (let letra = 0; letra < letrasElement.length; letra++) {
    letrasElement[letra].remove();
  }

  pintarPregunta();
  pintarRosco();
  iniciarTemporizador();
  iniciarPuntuaciones();
}

function pintarRosco() {
  for (let i = 0; i < letras.length; i++) {
    let letra = document.createElement('span');
    letra.className = 'letra';
    letra.id = "letra-" + i;
    letra.textContent = letras[i].letra;
    let giro = i * angulo - compensacion;
    let ancho = (roscoElement.offsetWidth / 2) - 25;
    letra.style.transform = 'rotate(' + giro + 'deg) translate(' + ancho + 'px) rotate(' + (-giro) + 'deg)';
    roscoElement.appendChild(letra);
  }
}

function pintarPregunta() {
  preguntaElement.innerHTML = letras[idPreguntaActual].pregunta;
  letraElement.innerHTML = letras[idPreguntaActual].letra;
}

function iniciarTemporizador() {
  restarSegundo();
  tiempoInvervalo = setInterval(() => {
    if (segundosActuales === 0) {
      finJuego();
    }
    restarSegundo();
  }, 1000);
}

function sendToServer(result) {
  console.log("Sending results to server...")
  const socket = io({
    auth: {
      serverOffset: 0,
    },
    ackTimeout: 10000,
    retries: 3,
  });
  socket.emit("new player finished", result);
}

function finJuego() {
  tiempoElement.innerHTML = "0:00";
  clearInterval(tiempoInvervalo);
  juegoElement.classList.add("oculta");
  finalElement.classList.remove("oculta");
  aciertosFinalesElement.innerText = aciertos;
  fallosFinalesElement.innerText = fallos;

  // TODO: Enviar resultados al servidor
  let resultadoConcursante = {
    name: concursante,
    successes: aciertos,
    mistakes: fallos,
    time: segundosTotales - segundosActuales,
    date: new Date()
  }
  sendToServer(resultadoConcursante);
  console.log(resultadoConcursante);
}



function iniciarPuntuaciones() {
  aciertosElement.innerHTML = aciertos;
  fallosElement.innerHTML = fallos;
}

function sumarPunto() {
  aciertos++;
  aciertosElement.innerHTML = aciertos;
  let letra = document.getElementById("letra-" + idPreguntaActual);
  letra.classList.add("verde");
  respuestaCorrectaAudio.play();
}

function sumarIncorrecto() {
  fallos++;
  fallosElement.innerHTML = fallos;
  let letra = document.getElementById("letra-" + idPreguntaActual);
  letra.classList.add("roja");
  respuestaIncorrectaAudio.play();
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

function procesarRespuesta() {
  let respuestaValue = respuestaElement.value;
  respuestaValue = respuestaValue.toUpperCase();

  if (respuestaValue === letras[idPreguntaActual].respuesta) {
    sumarPunto();
  } else {
    sumarIncorrecto();
  }
  respuestaElement.value = "";
  idPreguntaActual++;
  if (idPreguntaActual === letras.length) {
    // Se han acabado las preguntas
    finJuego();
  } else {
    // Siguiente pregunta
    pintarPregunta();
  }

}

function obtenerJson() {
  fetch("./src/preguntas.json")
    .then((response) => response.json())
    .then((data) => {
      json = data;
      letras = json.listado;
      angulo = 360 / letras.length;
    })
    .catch((error) => console.error("Error loading JSON file", error));
}

obtenerJson();

botonComenzarElement.addEventListener("click", (event) => {
  if (concursanteElement.value.trim() === "") {
    concursante = "Anónimo";
  } else {
    concursante = concursanteElement.value.trim();
  }
  inicioElement.classList.add("oculta");
  juegoElement.classList.remove("oculta");
  iniciar();
});

botonReiniciarElement.addEventListener("click", (event) => {
  finalElement.classList.add("oculta");
  inicioElement.classList.remove("oculta");
});

botonRespuestaElement.addEventListener("click", () => {
  procesarRespuesta();
});

respuestaElement.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    procesarRespuesta();
  }
});
