let rosco = document.getElementById('rosco');

let letras = ["I", "E", "S", "A", "L", "B", "A", "R", "R", "E", "G", "A", "S"];
//let abecedario = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

let angulo = 360 / letras.length;
let offset = 90;

for (let i = 0; i < letras.length; i++) {
  let letra = document.createElement('span');
  letra.className = 'letra';
  letra.id = "letra-" + i;
  letra.textContent = letras[i];
  let giro = i * angulo - offset;

  let ancho = (rosco.offsetWidth / 2) - 18;
  letra.style.transform = 'rotate(' + giro + 'deg) translate(' + ancho + 'px) rotate(' + (-giro) + 'deg)';

  rosco.appendChild(letra);
}
