const versionApp = "V1.01.1";
let busesGlobal = [];

document.getElementById("version").textContent = versionApp;
document.addEventListener("DOMContentLoaded", () => {
    init();
});

async function init() {
    try {
        console.log("Inicializando app...");

        const tablaFlota = document.getElementById("tabla-flota");

        if (!tablaFlota) {
            throw new Error("No se encontró <tbody id='tabla-flota'> en el DOM");
        }

        const response = await fetch("./flota.json");

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();

        busesGlobal = data.buses; 
        renderFlota(busesGlobal, tablaFlota);

        if (!data.buses || !Array.isArray(data.buses)) {
            throw new Error("El JSON no contiene un array 'buses'");
        }

        renderFlota(data.buses, tablaFlota);

        console.log("Flota cargada correctamente");
    } catch (error) {
        console.error("Error cargando flota:", error.message);
    }
}

/* =========================
   Render
========================= */

function renderFlota(buses, tablaFlota) {
    tablaFlota.innerHTML = "";

    buses.forEach(bus => {
        const tr = document.createElement("tr");
        tr.className = "border-t";

        tr.innerHTML = `
      <td class="p-3 font-bold">${bus.interno}</td>
      <td class="p-3">${bus.patente}</td>
      <td class="p-3">${bus.modelo} (${bus.anio})</td>
      <td class="p-3">${bus.capacidad}</td>
      <td class="p-3 font-semibold ${colorEstado(bus.estado)}">
        ${iconoEstado(bus.estado)} ${textoEstado(bus.estado)}
      </td>
      <td class="p-3 text-center">
        ${botonHistorial(bus)}
      </td>
    `;

        tablaFlota.appendChild(tr);
    });
}

/* =========================
   Helpers de UI
========================= */

function textoEstado(estado) {
    const map = {
        activa: "Activa",
        mantenimiento: "Mantenimiento",
        fuera_de_servicio: "Fuera de servicio",
        baja_definitiva: "Baja definitiva"
    };
    return map[estado] ?? estado;
}

function iconoEstado(estado) {
    const map = {
        activa: "🟢",
        mantenimiento: "🟡",
        fuera_de_servicio: "🔴",
        baja_definitiva: "⚫"
    };
    return map[estado] ?? "❔";
}

function colorEstado(estado) {
    const map = {
        activa: "text-green-600",
        mantenimiento: "text-yellow-500",
        fuera_de_servicio: "text-red-600",
        baja_definitiva: "text-gray-600"
    };
    return map[estado] ?? "";
}

function botonHistorial(bus) {
    if (bus.estado === "baja_definitiva") {
        return `
      <button class="bg-gray-400 text-white px-3 py-1 rounded cursor-not-allowed">
        <span class="hidden sm:inline">Ver historial</span>
        <span class="sm:hidden">Historial</span>
      </button>
    `;
    }

    return `
    <a
        href="/historial?id=${bus.id}"
        class="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition whitespace-nowrap"
        >
          <span class="hidden sm:inline">Ver historial</span>
          <span class="sm:hidden">Historial</span>
    </a>


  `;
}

/* =========================
   Filtros
========================= */

const filtroInterno = document.getElementById("filtro-interno");
const filtroPatente = document.getElementById("filtro-patente");
const filtroEstado = document.getElementById("filtro-estado");

filtroEstado.addEventListener("change", aplicarFiltros);
filtroInterno.addEventListener("input", aplicarFiltros);
filtroPatente.addEventListener("input", aplicarFiltros);

function aplicarFiltros() {
    const internoValue = document
        .getElementById("filtro-interno")
        .value
        .toLowerCase();

    const patenteValue = document
        .getElementById("filtro-patente")
        .value
        .toLowerCase();

    const estadoValue = document
        .getElementById("filtro-estado")
        .value;

    const filtrados = busesGlobal.filter(bus => {
        const internoMatch = bus.interno
            .toLowerCase()
            .includes(internoValue);

        const patenteMatch = bus.patente
            .toLowerCase()
            .includes(patenteValue);

        const estadoMatch =
            estadoValue === "" || bus.estado === estadoValue;

        return internoMatch && patenteMatch && estadoMatch;
    });

    const tablaFlota = document.getElementById("tabla-flota");
    renderFlota(filtrados, tablaFlota);
}

