import { toggleHidden } from "../scripts/script.js";

const contVencidas = document.getElementById("habilitaciones-vencidas");
const contPorVencer = document.getElementById("habilitaciones-por-vencer");
const contVigentes = document.getElementById("habilitaciones-vigentes");
const btnFormHabilitacion = document.getElementById("btn-form-habilitacion");
const formHabilitacion = document.getElementById("form-habilitacion");

toggleHidden(btnFormHabilitacion, formHabilitacion);
init();

async function init() {
    try {
        const res = await fetch("../flota.json");
        const data = await res.json();

        const hoy = new Date();
        const limite = new Date();
        limite.setDate(hoy.getDate() + 30);

        data.buses.forEach(bus => {
            const hab = bus.habilitaciones;
            if (!hab) return;

            Object.entries(hab).forEach(([tipo, info]) => {
                if (!info?.vence) return;

                const fechaVenc = new Date(info.vence);
                const card = crearCard(bus, tipo, info, fechaVenc);

                if (fechaVenc < hoy) {
                    contVencidas.appendChild(card);
                } else if (fechaVenc <= limite) {
                    contPorVencer.appendChild(card);
                } else {
                    contVigentes.appendChild(card);
                }
            });
        });

        mostrarVacios();

    } catch (error) {
        console.error("Error cargando habilitaciones:", error);
    }
}

//Crear diferenciaciones de habilitaciones
function crearCard(bus, tipo, info, fechaVenc) {
    const div = document.createElement("div");
    div.className = "bg-white p-4 rounded shadow border-l-4";

    div.classList.add(
        fechaVenc < new Date()
            ? "border-red-500"
            : fechaVenc <= new Date(Date.now() + 30 * 86400000)
                ? "border-yellow-500"
                : "border-green-500"
    );

    div.innerHTML = `
        <h4 class="font-bold text-blue-700">
            ${bus.interno} – ${bus.modelo}
        </h4>

        <p class="text-sm text-gray-600">
            📄 ${formatearTipo(tipo)}
        </p>

        <p class="text-sm mt-1">
            📅 Vence: <strong>${info.vence}</strong>
        </p>

        ${info.organismo ? `<p class="text-sm">🏛 ${info.organismo}</p>` : ""}
        ${info.compania ? `<p class="text-sm">🏢 ${info.compania}</p>` : ""}
    `;

    return div;
}

//Mostrar habilitaciones
function formatearTipo(tipo) {
    return {
        vtv: "VTV",
        seguro: "Seguro",
        habilitacionTransporte: "Habilitación Transporte",
        tacografo: "Tacógrafo",
        extintor: "Extintor"
    }[tipo] || tipo;
}

function mostrarVacios() {
    if (!contVencidas.children.length) {
        contVencidas.innerHTML = `<p class="text-gray-500">Sin vencidas</p>`;
    }
    if (!contPorVencer.children.length) {
        contPorVencer.innerHTML = `<p class="text-gray-500">Sin próximas a vencer</p>`;
    }
    if (!contVigentes.children.length) {
        contVigentes.innerHTML = `<p class="text-gray-500">Sin vigentes</p>`;
    }
}
