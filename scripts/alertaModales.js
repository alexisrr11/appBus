document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("./flota.json");
    const data = await res.json();

    const alertas = generarAlertas(data);
    if (alertas.length > 0) {
      mostrarModalAlertas(alertas);
    }

  } catch (error) {
    console.error("Error cargando JSON:", error);
  }
});

function generarAlertas(data) {
  const alertas = [];

  data.buses.forEach(bus => {

    if (
      bus.estado === "fuera_de_servicio" ||
      bus.estado === "baja_definitiva"
    ) {
      return;
    }
    
    const { interno, patente, habilitaciones } = bus;

    // 📅 HABILITACIONES
    const items = [
      { tipo: "VTV", data: habilitaciones.vtv },
      { tipo: "Seguro", data: habilitaciones.seguro },
      { tipo: "Habilitación", data: habilitaciones.habilitacionTransporte },
      { tipo: "Extintor", data: habilitaciones.extintor }
    ];

    items.forEach(item => {
      const estado = estadoVencimiento(item.data?.vence);

      if (estado) {
        alertas.push({
          tipo: item.tipo,
          interno,
          patente,
          estado,
          fecha: item.data.vence
        });
      }

      // 🚨 vencido por "vigente: false"
      if (item.data && item.data.vigente === false) {
        alertas.push({
          tipo: item.tipo,
          interno,
          patente,
          estado: "vencido",
          fecha: item.data.vence || "Sin fecha"
        });
      }
    });

    // 🔧 SERVICE por KM
    if (
      bus.proximoMantenimientoKm &&
      bus.kmDesdeUltimoService >= bus.proximoMantenimientoKm
    ) {
      alertas.push({
        tipo: "Service",
        interno,
        patente,
        estado: "vencido",
        fecha: "Por kilometraje"
      });
    }

    // 🚨 estados críticos
    if (!habilitaciones.aptaParaCircular) {
      alertas.push({
        tipo: "Unidad no apta",
        interno,
        patente,
        estado: "vencido",
        fecha: "No puede circular"
      });
    }

    if (habilitaciones.tacografo && !habilitaciones.tacografo.funcionando) {
      alertas.push({
        tipo: "Tacógrafo",
        interno,
        patente,
        estado: "vencido",
        fecha: "No funciona"
      });
    }
  });

  return alertas;
}

function estadoVencimiento(fecha) {
  if (!fecha) return null;

  const hoy = new Date();
  const vence = new Date(fecha);

  const diffDays = (vence - hoy) / (1000 * 60 * 60 * 24);

  if (diffDays < 0) return "vencido";
  if (diffDays <= 7) return "proximo";

  return null;
}

function mostrarModalAlertas(alertas) {
  const modal = document.createElement("div");

  modal.className = `
    fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50
  `;

  const lista = alertas.map(a => {
    const color = a.estado === "vencido" ? "text-red-600" : "text-yellow-600";
    const icono = a.estado === "vencido" ? "🚨" : "⚠️";

    return `
      <li class="mb-2 ${color}">
        ${icono} <strong>${a.interno}</strong> (${a.patente}) - ${a.tipo} → ${a.fecha}
      </li>
    `;
  }).join("");

  modal.innerHTML = `
    <div class="bg-white rounded-lg shadow-lg p-6 w-[500px] max-h-[80vh] overflow-auto">

      <h2 class="text-2xl font-bold mb-4 text-center">
        🔔 Alertas de la flota
      </h2>

      <ul class="text-sm text-left">
        ${lista}
      </ul>

      <div class="text-center mt-6">
        <button class="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 cerrar-modal">
          Entendido
        </button>
      </div>

    </div>
  `;

  modal.querySelector(".cerrar-modal").addEventListener("click", () => {
    modal.remove();
  });

  document.body.appendChild(modal);
}