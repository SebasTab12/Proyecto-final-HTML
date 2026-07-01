/*
  script.js - Control principal de Prodify
  Este archivo gestiona todas las interacciones de la web:
  - menú móvil
  - test de productividad
  - tareas
  - agenda
  - reto diario
  - temporizador Pomodoro
  - estadísticas
*/

// Alias rápido para document.querySelector.
const $ = selector => document.querySelector(selector);

/* ===== Test de productividad ===== */
// Lista de selectores con las preguntas del test.
const testSelectores = ["#p1", "#p2", "#p3", "#p4"];
const btnResultado = $("#btnResultado");
const resultadoTest = $("#resultadoTest");

if (btnResultado && resultadoTest) {
  btnResultado.addEventListener("click", evaluarTest);
}

function evaluarTest() {
  // Sumar valores de cada pregunta y crear un puntaje.
  const total = testSelectores.reduce((suma, selector) => {
    const elemento = $(selector);
    return suma + (elemento ? Number(elemento.value) : 0);
  }, 0);

  const { mensaje, porcentaje } = calcularNivel(total);
  mostrarResultado(mensaje, total);
  guardarLocal("puntaje", total);
  guardarLocal("porcentaje", porcentaje);
  guardarLocal("mensaje", mensaje);
}

function calcularNivel(total) {
  // Determina el mensaje y la barra de progreso según el resultado.
  if (total >= 10) return { mensaje: "🟢 Excelente. Tienes muy buenos hábitos.", porcentaje: 100 };
  if (total >= 7) return { mensaje: "🟡 Vas bien, pero todavía puedes mejorar.", porcentaje: 70 };
  return { mensaje: "🔴 Necesitas mejorar tu organización.", porcentaje: 40 };
}

function mostrarResultado(mensaje, total) {
  // Muestra la tarjeta con el resultado del test.
  resultadoTest.innerHTML = `
    <div class="tarjeta">
      <h2>${mensaje}</h2>
      <p>Puntaje obtenido: <strong>${total}</strong></p>
    </div>
  `;
}

function guardarLocal(clave, valor) {
  // Guarda cualquier dato simple en localStorage.
  localStorage.setItem(clave, valor);
}

/* ===== Gestor de tareas ===== */
const tareaInput = $("#tareaInput");
const botonAgregar = $("#agregarTarea");
const listaTareas = $("#listaTareas");
const tareasKey = "tareas";

if (tareaInput && botonAgregar && listaTareas) {
  cargarTareas();
  botonAgregar.addEventListener("click", agregarTarea);
  listaTareas.addEventListener("click", event => {
    const boton = event.target.closest("button");
    const li = event.target.closest("li");
    if (!li) return;
    if (boton) li.remove();
    else li.classList.toggle("completada");
    guardarTareas();
  });
}

function agregarTarea() {
  const texto = tareaInput.value.trim();
  if (!texto) return alert("Escribe una tarea.");

  const li = document.createElement("li");
  li.innerHTML = `<span>${texto}</span><button>🗑</button>`;
  listaTareas.appendChild(li);
  guardarTareas();
  tareaInput.value = "";
}

function guardarTareas() {
  const datos = [...listaTareas.querySelectorAll("li")].map(li => ({
    texto: li.querySelector("span").textContent.trim(),
    completada: li.classList.contains("completada")
  }));
  localStorage.setItem(tareasKey, JSON.stringify(datos));
}

function cargarTareas() {
  const datos = localStorage.getItem(tareasKey);
  if (!datos) return;
  try {
    const tareas = JSON.parse(datos);
    if (!Array.isArray(tareas)) throw 0;
    listaTareas.innerHTML = tareas.map(t =>
      `<li${t.completada ? " class='completada'" : ""}><span>${t.texto}</span><button>🗑</button></li>`
    ).join("");
  } catch {
    listaTareas.innerHTML = "";
    localStorage.removeItem(tareasKey);
  }
}

/* ===== Agenda personal ===== */
const actividadInput = $("#actividadInput");
const fechaInput = $("#fechaInput");
const horaInput = $("#horaInput");
const botonActividad = $("#agregarActividad");
const listaAgenda = $("#listaAgenda");

if (actividadInput && fechaInput && horaInput && botonActividad && listaAgenda) {

  fechaInput.min = new Date().toISOString().split("T")[0];
  
  cargarAgenda();
  botonActividad.addEventListener("click", agregarActividad);
  listaAgenda.addEventListener("click", event => {
    if (event.target.tagName === "BUTTON") {
      event.target.closest(".actividad").remove();
      guardarAgenda();
    }
  });
}

function agregarActividad() {
  if (!actividadInput.value || !fechaInput.value || !horaInput.value) {
    return alert("Completa todos los campos.");
  }

  const actividad = document.createElement("div");
  actividad.className = "actividad";
  actividad.innerHTML = `
    <h3>${actividadInput.value}</h3>
    <p>📅 ${fechaInput.value}</p>
    <p>⏰ ${horaInput.value}</p>
    <button>Eliminar</button>
  `;

  listaAgenda.appendChild(actividad);
  guardarAgenda();
  actividadInput.value = "";
  fechaInput.value = "";
  horaInput.value = "";
}

function guardarAgenda() {
  // Guarda la agenda como HTML para mantener la vista del usuario.
  localStorage.setItem("agenda", listaAgenda.innerHTML);
}

function cargarAgenda() {
  // Restaura la agenda cuando la página se carga.
  listaAgenda.innerHTML = localStorage.getItem("agenda") || "";
}

/* ===== Reto diario ===== */
const retos = [
  "Organiza tu escritorio.",
  "Estudia durante 30 minutos.",
  "No uses el celular por una hora.",
  "Completa todas tus tareas.",
  "Lee 10 páginas de un libro.",
  "Haz una lista de prioridades.",
  "Utiliza el método Pomodoro.",
  "Levántate 30 minutos más temprano."
];

const textoReto = $("#retoDiario");
if (textoReto) {
  // Usa el día del mes para cambiar el reto cada día.
  const dia = new Date().getDate();
  textoReto.textContent = retos[dia % retos.length];
}

/* ===== Temporizador Pomodoro ===== */
const reloj = $("#temporizador");
const iniciar = $("#iniciar");
const pausar = $("#pausar");
const reiniciar = $("#reiniciar");
let tiempo = 25 * 60; // 25 minutos en segundos.
let intervalo = null;

if (reloj && iniciar && pausar && reiniciar) {
  actualizarReloj();
  iniciar.addEventListener("click", iniciarPomodoro);
  pausar.addEventListener("click", pausarPomodoro);
  reiniciar.addEventListener("click", reiniciarPomodoro);
}

function actualizarReloj() {
  const minutos = String(Math.floor(tiempo / 60)).padStart(2, "0");
  const segundos = String(tiempo % 60).padStart(2, "0");
  reloj.textContent = `${minutos}:${segundos}`;
}

function iniciarPomodoro() {
  if (intervalo) return; // Evita varios intervalos activos.
  intervalo = setInterval(() => {
    if (tiempo > 0) {
      tiempo -= 1;
      actualizarReloj();
    } else {
      clearInterval(intervalo);
      intervalo = null;
      alert("🎉 ¡Pomodoro finalizado!");
    }
  }, 1000);
}

function pausarPomodoro() {
  clearInterval(intervalo);
  intervalo = null;
}

function reiniciarPomodoro() {
  clearInterval(intervalo);
  intervalo = null;
  tiempo = 25 * 60;
  actualizarReloj();
}

/* ===== Estadísticas ===== */
const tareasCompletadas = $("#tareasCompletadas");
const tareasPendientes = $("#tareasPendientes");
const nivel = $("#nivelProductividad");
const barraProductividad = $("#barraProductividad");
const barraTareas = $("#barraTareas");
const consejo = $("#consejoEstadistica");

if (nivel) cargarEstadisticas();

function cargarEstadisticas() {
  // Cargar datos de localStorage para mostrar el progreso.
  const puntaje = Number(localStorage.getItem("puntaje")) || 0;
  const porcentaje = Number(localStorage.getItem("porcentaje")) || 0;
  const mensaje = localStorage.getItem("mensaje") || "Sin evaluar";
  const tareas = localStorage.getItem("tareas") || "";

  const totalTareas = (tareas.match(/<li>/g) || []).length;

  nivel.textContent = mensaje;
  if (tareasPendientes) tareasPendientes.textContent = totalTareas;
  if (tareasCompletadas) tareasCompletadas.textContent = puntaje;
  if (barraProductividad) barraProductividad.style.width = `${porcentaje}%`;
  if (barraTareas) barraTareas.style.width = `${Math.min(totalTareas * 20, 100)}%`;

  if (consejo) consejo.textContent = seleccionarConsejo(puntaje);
}

function seleccionarConsejo(puntaje) {
  if (puntaje >= 10) return "Excelente trabajo. Sigue manteniendo tus hábitos.";
  if (puntaje >= 7) return "Vas por buen camino. Intenta organizar mejor tu tiempo.";
  return "Empieza utilizando una agenda y el método Pomodoro.";
}

/* ===== Utilidades ===== */
window.addEventListener("load", () => {
  console.log("Prodify cargado correctamente.");
});

/* ===== Cambio de tema ===== */

const modo = $("#modo");

if(modo){

    if(localStorage.getItem("tema")=="claro"){
        document.body.classList.add("claro");
        modo.textContent="🌙";
    }else{
        modo.textContent="☀️";
    }

    modo.onclick=()=>{

        document.body.classList.toggle("claro");

        if(document.body.classList.contains("claro")){
            localStorage.setItem("tema","claro");
            modo.textContent="🌙";
        }else{
            localStorage.removeItem("tema");
            modo.textContent="☀️";
        }

    };

}