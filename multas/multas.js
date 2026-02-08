const container = document.getElementById("multas-container");
const abrirFormMultas = document.getElementById("abrir-form-multas");

abrirFormMultas.addEventListener("click", () => {
    document.getElementById("form-multa").classList.toggle("hidden");
    abrirFormMultas.textContent = document.getElementById("form-multa").classList.contains("hidden") ? "➕" : "➖";
});

function obtenerFiltros() {
    const params = new URLSearchParams(window.location.search);

    return {
        interno: (params.get("interno") || "").toLowerCase(),
        patente: (params.get("patente") || "").toLowerCase(),
        motivo: (params.get("motivo") || "").toLowerCase()
    };
}


async function initMultas() {
    try {
        const res = await fetch("../flota.json");
        const data = await res.json();

        // Juntamos todas las multas de todos los buses
        const multas = data.buses.flatMap(bus =>
            (bus.multas || []).map(multa => ({
                ...multa,
                interno: bus.interno,
                patente: bus.patente
            }))
        );

        if (multas.length === 0) {
            container.innerHTML = "<p class='text-gray-500'>No hay multas registradas</p>";
            return;
        }

        const filtros = obtenerFiltros();

        const multasFiltradas = multas.filter(multa => {
            const matchInterno = multa.interno
                .toLowerCase()
                .includes(filtros.interno);

            const matchPatente = multa.patente
                .toLowerCase()
                .includes(filtros.patente);

            const matchMotivo = multa.tipo
                .toLowerCase()
                .includes(filtros.motivo);

            return matchInterno && matchPatente && matchMotivo;
        });


        renderMultas(multasFiltradas);

    } catch (error) {
        console.error(error);
        container.innerHTML = "<p>Error cargando multas</p>";
    }
}

function renderMultas(multas) {
    container.innerHTML = "";

    multas.forEach(multa => {
        const card = document.createElement("div");
        card.className = `
            bg-white p-4 rounded shadow
            border-l-4 ${colorPorEstado(multa.estado)}
        `;

        card.innerHTML = `
            <div class="flex justify-between text-sm text-gray-500 mb-1">
                <span>${multa.fecha}</span>
                <span class="font-semibold">${multa.estado.toUpperCase()}</span>
            </div>

            <p class="text-gray-800 font-semibold mb-1">
                ${multa.tipo}
            </p>

            <p class="text-sm text-gray-600">
                📍 ${multa.lugar}
            </p>

            <p class="text-sm text-gray-700 font-semibold mt-1">
                🚍 Interno ${multa.interno} · ${multa.patente}
            </p>

            <p class="text-sm mt-2 font-bold">
                💰 $${multa.monto.toLocaleString()}
            </p>

            <p class="text-xs text-gray-500 mt-1">
                Responsable: ${multa.responsable}
            </p>
        `;

        container.appendChild(card);
    });
}

function colorPorEstado(estado) {
    const map = {
        pendiente: "border-red-500",
        pagada: "border-green-500",
        anulada: "border-gray-400"
    };

    return map[estado] || "border-blue-500";
}

initMultas();
