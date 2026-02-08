let todosLosMantenimientos = [];
const abrirFormulario = document.getElementById("abrir-formulario");
const contenedor = document.getElementById("listado-mantenimientos");


abrirFormulario.addEventListener("click", () => {
    document.getElementById("form-mantenimiento").classList.toggle("hidden");
    abrirFormulario.textContent = document.getElementById("form-mantenimiento").classList.contains("hidden") ? "➕" : "➖";
});


init();

async function init() {
    try {
        const res = await fetch("/flota.json");
        const data = await res.json();

        // Obtener todos los mantenimientos de todos los buses
        const mantenimientos = [];
        data.buses.forEach(bus => {
            if (bus.service && bus.service.length) {
                bus.service.forEach(s => {
                    mantenimientos.push({
                        interno: bus.interno,
                        patente: bus.patente,
                        modelo: bus.modelo,
                        anio: bus.anio,
                        ...s
                    });
                });
            }
        });

        // Ordenar por fecha más reciente
        mantenimientos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        todosLosMantenimientos = mantenimientos;

        // Render inicial
        renderListado(todosLosMantenimientos);

        // Renderizar
        if (mantenimientos.length === 0) {
            contenedor.innerHTML = `<p class="text-gray-500">No hay mantenimientos registrados</p>`;
            return;
        }

        mantenimientos.forEach(m => contenedor.appendChild(renderMantenimientoCard(m)));



    } catch (error) {
        console.error("Error cargando mantenimientos:", error);
        contenedor.innerHTML = `<p class="text-red-500">Error cargando mantenimientos</p>`;
    }
}

// Render de cada tarjeta de mantenimiento
function renderMantenimientoCard(m) {
    const card = document.createElement("div");
    card.className = "bg-white p-4 rounded shadow border-l-4 border-yellow-500";

    card.innerHTML = `
        <h3 class="text-xl font-bold text-blue-700">
            Interno ${m.interno} - ${m.modelo} (${m.anio})
        </h3>

        <p class="text-sm text-gray-600 mt-1">
            🚍 Patente: <strong>${m.patente}</strong>
        </p>

        <p class="text-sm mt-2">
            📅 Fecha: <strong>${m.fecha}</strong>
        </p>

        <p class="text-sm mt-1 font-semibold">
            Tipo: ${m.tipo.toUpperCase()}
        </p>

        ${m.detalle ? `<p class="text-gray-800 mt-1">Detalle: ${m.detalle}</p>` : ""}
        ${m.km ? `<p class="text-sm mt-1">Km: ${m.km.toLocaleString()}</p>` : ""}
        ${m.taller ? `<p class="text-sm mt-1">Taller: ${m.taller}</p>` : ""}
        ${m.reportadoPor ? `<p class="text-sm mt-1">Reportado por: ${m.reportadoPor}</p>` : ""}
    `;

    return card;
}

//Funciones para filtrar mantenimiento
function renderListado(lista) {
    contenedor.innerHTML = "";

    if (lista.length === 0) {
        contenedor.innerHTML = `<p class="text-gray-500">No hay resultados</p>`;
        return;
    }

    lista.forEach(m => contenedor.appendChild(renderMantenimientoCard(m)));
}

const formFiltro = document.querySelector("form");

formFiltro.addEventListener("submit", (e) => {
    e.preventDefault();

    const interno = document.getElementById("interno-mantenimiento").value.toLowerCase();
    const patente = document.getElementById("patente-mantenimiento").value.toLowerCase();
    const tipo = document.getElementById("tipo-falla").value.toLowerCase();

    const filtrados = todosLosMantenimientos.filter(m => {
        return (
            (!interno || m.interno.toLowerCase().includes(interno)) &&
            (!patente || m.patente.toLowerCase().includes(patente)) &&
            (!tipo || m.tipo.toLowerCase().includes(tipo))
        );
    });

    renderListado(filtrados);
});
