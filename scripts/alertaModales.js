document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("./flota.json");
    const data = await res.json();

    crearModalesVencimientos(data);

  } catch (error) {
    console.error("Error cargando JSON:", error);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  crearModalesVencimientos(data);
});

function estaPorVencer(fechaVencimiento) {
  if (!fechaVencimiento) return false;

  const hoy = new Date();
  const vence = new Date(fechaVencimiento);

  const diffTime = vence - hoy;
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  return diffDays <= 7;
}

function crearModalesVencimientos(data) {
  const contenedor = document.createElement("div");
  contenedor.id = "modales-vencimientos";
  document.body.appendChild(contenedor);

  data.buses.forEach(bus => {
    const hab = bus.habilitaciones;

    const items = [
      { tipo: "VTV", data: hab.vtv },
      { tipo: "Seguro", data: hab.seguro },
      { tipo: "Habilitación", data: hab.habilitacionTransporte },
      { tipo: "Extintor", data: hab.extintor }
    ];

    items.forEach(item => {
      if (estaPorVencer(item.data?.vence)) {
        const modal = document.createElement("div");

        modal.className = `
          fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50
        `;

        modal.innerHTML = `
          <div class="bg-white rounded-lg shadow-lg p-6 w-[400px] text-center animate-fadeIn">
            
            <h2 class="text-xl font-bold text-red-600 mb-2">
              ⚠️ Vencimiento próximo
            </h2>

            <p class="mb-4 text-gray-700">
              <strong>${item.tipo}</strong> del vehículo 
              <strong>${bus.interno} (${bus.patente})</strong>
              vence el:
            </p>

            <p class="text-lg font-bold text-blue-700 mb-4">
              ${item.data.vence}
            </p>

            <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cerrar-modal">
              Entendido
            </button>

          </div>
        `;

        // cerrar modal
        modal.querySelector(".cerrar-modal").addEventListener("click", () => {
          modal.remove();
        });

        contenedor.appendChild(modal);
      }
    });
  });
}
