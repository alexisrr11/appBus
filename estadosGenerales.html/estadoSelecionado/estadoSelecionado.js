const titulo = document.getElementById("listado-titulo");
const contenedor = document.getElementById("listado-unidades");

async function init() {
  const params = new URLSearchParams(window.location.search);
  const estado = params.get("estado");

  if (!estado) {
    titulo.textContent = "Estado no especificado";
    return;
  }

  const res = await fetch("../../flota.json");
  const data = await res.json();

  const busesFiltrados = data.buses.filter(
    b => b.estado === estado
  );

  titulo.textContent = tituloPorEstado(estado);

  if (busesFiltrados.length === 0) {
    contenedor.innerHTML = `<p class="text-gray-500">No hay unidades</p>`;
    return;
  }

  busesFiltrados.forEach(bus => {
    contenedor.appendChild(renderUnidad(bus));
  });
}

init();

//Render cada unidad
function renderUnidad(bus) {
  const card = document.createElement("div");
  card.className = "bg-white p-4 rounded shadow border-l-4 " + colorEstado(bus.estado);

  card.innerHTML = `
    <h3 class="text-xl font-bold text-blue-700">
      Interno ${bus.interno}
    </h3>

    <p class="text-sm text-gray-600">
      ${bus.modelo} (${bus.anio})
    </p>

    <p class="text-sm mt-2">
      🚍 Patente: <strong>${bus.patente}</strong>
    </p>

    <p class="text-sm">
      📊 Km: ${bus.kmTotal.toLocaleString()}
    </p>

    <p class="text-sm mt-2 font-semibold">
      ${estadoTexto(bus.estado)}
    </p>

    <a href="../../historial/historial.html?id=${bus.id}"
       class="text-blue-500 text-sm mt-3 inline-block">
       Ver historial →
    </a>
  `;

  return card;
}

//Titulos

function tituloPorEstado(estado) {
  const map = {
    activa: "🟢 Unidades operativas",
    salen: "🟦 Unidades saliendo a la calle",
    mantenimiento: "🟡 Unidades en taller",
    fuera_de_servicio: "🔴 Fuera de servicio",
    baja_definitiva: "⚫ Baja definitiva"
  };
  return map[estado] || estado;
}

function estadoTexto(estado) {
  const map = {
    activa: "🟢 Activa",
    salen: "🟦 En calle",
    mantenimiento: "🟡 Mantenimiento",
    fuera_de_servicio: "🔴 Fuera de servicio",
    baja_definitiva: "⚫ Baja definitiva"
  };
  return map[estado] || estado;
}

function colorEstado(estado) {
  const map = {
    activa: "border-green-500",
    salen: "border-blue-500",
    mantenimiento: "border-yellow-500",
    fuera_de_servicio: "border-red-500",
    baja_definitiva: "border-gray-500"
  };
  return map[estado] || "border-blue-500";
}

