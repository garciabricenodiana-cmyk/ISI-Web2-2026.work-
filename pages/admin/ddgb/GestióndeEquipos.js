// CRUD de Equipos

//URL DE EJEMPLO
var API_URL = "https://localhost:7001/api";
var miToken = "";
var equipoEditandoId = null;

// LOGIN
function iniciarSesion() {
  var email = document.getElementById("campo-email").value.trim();
  var pass = document.getElementById("campo-password").value;

  fetch(API_URL + "/authentication/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email, password: pass })
  })
  .then(function(res) {
    if (!res.ok) throw new Error("Credenciales incorrectas");
    return res.json();
  })
  .then(function(data) {
    miToken = data.token || data.accessToken || "";
    document.getElementById("estado-sesion").textContent = "Sesión iniciada: " + email;
    document.getElementById("lista-equipos").style.display = "block";
    cargarEquipos();
  })
  .catch(function(err) {
    document.getElementById("estado-sesion").textContent = "Error: " + err.message;
  });
}

// LISTAR
function cargarEquipos() {
  fetch(API_URL + "/teams", {
    headers: { "Authorization": "Bearer " + miToken }
  })
  .then(function(res) {
    if (!res.ok) throw new Error("No se pudieron cargar los equipos");
    return res.json();
  })
  .then(function(equipos) {
    mostrarTabla(equipos);
  })
  .catch(function(err) {
    document.getElementById("msg-equipos").textContent = "Error: " + err.message;
  });
}

function mostrarTabla(equipos) {
  var contenedor = document.getElementById("contenedor-tabla");

  if (equipos.length === 0) {
    contenedor.innerHTML = "<p>No hay equipos.</p>";
    return;
  }

  var html = "<table border='1' cellpadding='5'>";
  html += "<tr><th>ID</th><th>Nombre</th><th>Descripción</th><th>Miembros</th><th>Acciones</th></tr>";

  for (var i = 0; i < equipos.length; i++) {
    var eq = equipos[i];
    html += "<tr>";
    html += "<td>" + eq.id + "</td>";
    html += "<td>" + (eq.name || "") + "</td>";
    html += "<td>" + (eq.description || "") + "</td>";
    html += "<td>" + (eq.memberCount || 0) + "</td>";
    html += "<td>";
    html += "<button onclick='abrirFormularioEditar(" + eq.id + ", \"" + (eq.name || "").replace(/"/g, "") + "\", \"" + (eq.description || "").replace(/"/g, "") + "\")'>Editar</button> ";
    html += "<button onclick='eliminarEquipo(" + eq.id + ")'>Eliminar</button>";
    html += "</td>";
    html += "</tr>";
  }

  html += "</table>";
  contenedor.innerHTML = html;
}

// FORMULARIO
function abrirFormularioNuevo() {
  equipoEditandoId = null;
  document.getElementById("titulo-form").textContent = "Nuevo Equipo";
  document.getElementById("campo-id").value = "";
  document.getElementById("campo-nombre").value = "";
  document.getElementById("campo-descripcion").value = "";
  document.getElementById("msg-form").textContent = "";
  document.getElementById("seccion-formulario").style.display = "block";
}

function abrirFormularioEditar(id, nombre, descripcion) {
  equipoEditandoId = id;
  document.getElementById("titulo-form").textContent = "Editar Equipo";
  document.getElementById("campo-id").value = id;
  document.getElementById("campo-nombre").value = nombre;
  document.getElementById("campo-descripcion").value = descripcion;
  document.getElementById("msg-form").textContent = "";
  document.getElementById("seccion-formulario").style.display = "block";
}

function cerrarFormulario() {
  document.getElementById("seccion-formulario").style.display = "none";
  equipoEditandoId = null;
}

// CREAR / EDITAR
function guardarEquipo() {
  var nombre = document.getElementById("campo-nombre").value.trim();
  var descripcion = document.getElementById("campo-descripcion").value.trim();

  if (!nombre) {
    document.getElementById("msg-form").textContent = "El nombre es obligatorio.";
    return;
  }

  var datos = { name: nombre, description: descripcion };

  // Decidimos si es POST (crear) o PUT (editar)
  var url = equipoEditandoId === null
    ? API_URL + "/teams"
    : API_URL + "/teams/" + equipoEditandoId;

  var metodo = equipoEditandoId === null ? "POST" : "PUT";

  fetch(url, {
    method: metodo,
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + miToken
    },
    body: JSON.stringify(datos)
  })
  .then(function(res) {
    if (!res.ok) throw new Error("Error al guardar el equipo");
    return res.json();
  })
  .then(function() {
    document.getElementById("msg-form").textContent = "Guardado correctamente.";
    cerrarFormulario();
    cargarEquipos();
  })
  .catch(function(err) {
    document.getElementById("msg-form").textContent = "Error: " + err.message;
  });
}

// ELIMINAR
function eliminarEquipo(id) {
  if (!confirm("¿Eliminar este equipo?")) return;

  fetch(API_URL + "/teams/" + id, {
    method: "DELETE",
    headers: { "Authorization": "Bearer " + miToken }
  })
  .then(function(res) {
    if (!res.ok) throw new Error("No se pudo eliminar");
    document.getElementById("msg-equipos").textContent = "Equipo eliminado.";
    cargarEquipos();
  })
  .catch(function(err) {
    document.getElementById("msg-equipos").textContent = "Error: " + err.message;
  });
}
