import TeamsService from "../../../shared/services/teams.service.js";
import TeamRequest from "../../../shared/models/request/team.request.js";

const teamsService = new TeamsService();

var equipoEditandoId = null;

cargarEquipos();

async function cargarEquipos() {
  try {
    const equipos = await teamsService.get();
    mostrarTabla(equipos);
  } catch (e) {
    document.getElementById("msg-equipos").textContent = "Error: " + e.message;
  }
}

function mostrarTabla(equipos) {
  const tbody = document.getElementById("tabla-body");

  if (equipos.length === 0) {
    tbody.innerHTML = `<tr><td colspan= "5">No  hay Equipos</td></tr>`;
    return;
  }

  tbody.innerHTML = equipos.map(eq => `
    <tr>
      <td>${eq.id}</td>
      <td>${eq.name}</td>
      <td>${eq.description || ""}</td>
      <td>${eq.memberCount}</td>
      <td>
        <button onclick="abrirFormularioEditar(${eq.id}, '${(eq.name || "").replace(/'/g, "")}', '${(eq.description || "").replace(/'/g, "")}')">Editar</button>
        <button onclick="eliminarEquipo(${eq.id})">Eliminar</button>
      </td>
    </tr>
  `).join("");
}

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

async function guardarEquipo() {
  const nombre = document.getElementById("campo-nombre").value.trim();
  const descripcion = document.getElementById("campo-descripcion").value.trim();

  if (!nombre) {
    document.getElementById("msg-form").textContent = "El nombre es obligatorio.";
    return;
  }

  // Usamos el modelo TeamRequest para armar el cuerpo de la petición
  const request = new TeamRequest(nombre, descripcion);

  try {
    if (equipoEditandoId === null) {
      // CREATE: el servicio encapsula el POST (obs. 2 y 4)
      await teamsService.create(request);
    } else {
      // UPDATE: el servicio encapsula el PUT
      await teamsService.put(`/teams/${equipoEditandoId}`, request.toJson());
    }
    document.getElementById("msg-form").textContent = "Guardado correctamente.";
    cerrarFormulario();
    cargarEquipos();
  } catch (e) {
    document.getElementById("msg-form").textContent = "Error: " + e.message;
  }
}

async function eliminarEquipo(id) {
  if (!confirm("¿Eliminar este equipo?")) return;

  try {
    // El servicio encapsula el DELETE (obs. 4)
    await teamsService.delete(`/teams/${id}`);
    document.getElementById("msg-equipos").textContent = "Equipo eliminado.";
    cargarEquipos();
  } catch (e) {
    document.getElementById("msg-equipos").textContent = "Error: " + e.message;
  }
}

window.abrirFormularioNuevo = abrirFormularioNuevo;
window.abrirFormularioEditar = abrirFormularioEditar;
window.cerrarFormulario = cerrarFormulario;
window.guardarEquipo = guardarEquipo;
window.eliminarEquipo = eliminarEquipo;
window.cargarEquipos = cargarEquipos;