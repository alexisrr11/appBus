const selectBus = document.getElementById("bus-reporte");
const formReporte = document.getElementById("form-reporte");

const URL_FLOTA = "../flota.json";

async function cargarInternos() {
  try {
    const response = await fetch(URL_FLOTA);

    if (!response.ok) {
      throw new Error("No se pudo cargar la flota");
    }

    const data = await response.json();
    const buses = data.buses;

    // Opción placeholder
    selectBus.innerHTML = `
      <option value="">Seleccione un interno</option>
    `;

    buses.forEach(bus => {
      const option = document.createElement("option");
      option.value = bus.id;
      option.textContent = `${bus.interno} - ${bus.patente}`;
      option.disabled = bus.estado === "baja_definitiva";

      selectBus.appendChild(option);
    });

  } catch (error) {
    console.error("Error cargando internos:", error);
    alert("Error al cargar los internos");
  }
}

// Manejo del formulario
formReporte.addEventListener("submit", (e) => {
  e.preventDefault();

  const reporte = {
    busId: selectBus.value,
    fecha: document.getElementById("fecha-reporte").value,
    detalle: document.getElementById("detalle-reporte").value,
  };

  console.log("Reporte a enviar:", reporte);

  // 👉 Más adelante:
  // fetch POST a backend
  // o push a JSON simulado
  formReporte.reset();
});

// Inicialización
cargarInternos();
