const container = document.getElementById("historial-container");
const titulo = document.querySelector("h2");
const infoInterno = document.getElementById("info-interno");

async function init() {
    try {
        const params = new URLSearchParams(window.location.search);
        const id = Number(params.get("id"));

        if (!id) {
            container.innerHTML = "<p>ID inválido</p>";
            return;
        }

        const res = await fetch("/flota.json");
        const data = await res.json();

        const bus = data.buses.find(b => b.id === id);

        if (!bus) {
            container.innerHTML = "<p>Unidad no encontrada</p>";
            return;
        }

        titulo.textContent = "HISTORIAL UNIDAD";

        infoInterno.innerHTML = `
            ${bus.interno} · 
            ${bus.patente} · 
            ${bus.modelo} (${bus.anio}) · 
            Cap. ${bus.capacidad} · 
            ${estadoTexto(bus.estado)} · 
            ${bus.kmTotal.toLocaleString()} km
        `;

        renderHistorial(bus);

    } catch (error) {
        console.error(error);
        container.innerHTML = "<p>Error cargando historial</p>";
    }
}

/* ===============================
   RENDER
================================ */

function renderHistorial(bus) {
    container.innerHTML = "";

    renderBloque(
        "🔧 SERVICE / FALLAS",
        bus.service || [],
        renderServiceCard
    );

    renderBloque(
        "🚨 MULTAS",
        bus.multas || [],
        renderMultaCard
    );

    const habilitacionesHistorial = normalizarHabilitaciones(bus.habilitaciones);

    renderBloque(
        "📄 HABILITACIONES",
        habilitacionesHistorial,
        renderHabilitacionCard
    );
}



function renderBloque(titulo, items, renderFn) {
    if (!Array.isArray(items)) {
        items = items ? [items] : [];
    }

    if (items.length === 0) return;

    const h4 = document.createElement("h4");
    h4.className = "text-xl font-bold text-gray-700 mt-8 mb-3";
    h4.textContent = titulo;

    container.appendChild(h4);

    items.forEach(item => {
        container.appendChild(renderFn(item));
    });
}

/* ===============================
   RENDER SERVICE CARD
================================ */

function renderServiceCard(evento) {
    const card = document.createElement("div");
    card.className = `bg-white p-4 rounded shadow border-l-4 ${colorPorEvento(evento)}`;

    card.innerHTML = `
        <div class="flex justify-between text-sm text-gray-500 mb-1">
            <span>${evento.fecha}</span>
            <span class="font-semibold">${evento.tipo.toUpperCase()}</span>
        </div>

        <p class="text-gray-800">${evento.detalle}</p>

        ${evento.km ? `<p class="text-sm text-gray-500 mt-1">Km: ${evento.km}</p>` : ""}
        ${evento.taller ? `<p class="text-sm text-gray-500 mt-1">Taller: ${evento.taller}</p>` : ""}
        ${evento.reportadoPor ? `<p class="text-sm text-gray-500 mt-1">Reportado por: ${evento.reportadoPor}</p>` : ""}
    `;

    return card;
}

/* ===============================
   RENDER MULTAS CARD
================================ */

function renderMultaCard(multa) {
    const card = document.createElement("div");
    card.className = `
        bg-white p-4 rounded shadow border-l-4
        ${multa.estado === "pagada" ? "border-green-500" : "border-red-500"}
    `;

    card.innerHTML = `
        <div class="flex justify-between text-sm text-gray-500 mb-1">
            <span>${multa.fecha}</span>
            <span class="font-semibold">${multa.estado.toUpperCase()}</span>
        </div>

        <p class="font-semibold text-gray-800">${multa.tipo}</p>
        ${multa.lugar ? `<p class="text-sm text-gray-600">📍 ${multa.lugar}</p>` : ""}


        <p class="text-sm font-bold mt-2">
            💰 $${multa.monto.toLocaleString()}
        </p>

        <p class="text-xs text-gray-500">
            Responsable: ${multa.responsable}
        </p>
    `;

    return card;
}

/* ===============================
   RENDER HABILITACIONES CARD
================================ */

function renderHabilitacionCard(hab) {
    const card = document.createElement("div");

    const estado = hab.vigente ? "vigente" : "vencida";

    card.className = `
        bg-white p-4 rounded shadow border-l-4
        ${estado === "vigente" ? "border-green-500" : "border-red-500"}
    `;

    card.innerHTML = `
        <div class="flex justify-between text-sm text-gray-500 mb-1">
            <span>${hab.fechaVencimiento || hab.fecha || "-"}</span>
            <span class="font-semibold">${hab.tipo}</span>
        </div>

        ${hab.detalle ? `<p class="text-sm text-gray-700">${hab.detalle}</p>` : ""}

        ${hab.organismo ? `<p class="text-xs text-gray-500">🏛️ ${hab.organismo}</p>` : ""}
    `;

    return card;
}



/* ===============================
   HELPERS
================================ */

function colorPorEvento(evento) {
    if (evento.tipoEvento === "multa") {
        return evento.estado === "pagada"
            ? "border-green-500"
            : "border-red-500";
    }

    const map = {
        service: "border-green-500",
        mantenimiento: "border-yellow-500",
        falla: "border-red-500",
        baja: "border-gray-500"
    };

    return map[evento.tipo] || "border-blue-500";
}

function labelEvento(evento) {
    if (evento.tipoEvento === "multa") return "🚨 MULTA";
    return evento.tipo.toUpperCase();
}

function estadoTexto(estado) {
    const map = {
        activa: "🟢 Activa",
        mantenimiento: "🟡 Mantenimiento",
        fuera_de_servicio: "🔴 Fuera de servicio",
        baja_definitiva: "⚫ Baja definitiva"
    };
    return map[estado] || estado;
}

function colorPorHabilitacion(hab) {
    const map = {
        vigente: "border-green-500",
        por_vencer: "border-yellow-500",
        vencida: "border-red-500"
    };
    return map[hab.estado] || "border-gray-400";
}

function estadoHabilitacionTexto(estado) {
    const map = {
        vigente: "🟢 Vigente",
        por_vencer: "🟡 Por vencer",
        vencida: "🔴 Vencida"
    };
    return map[estado] || estado;
}

//Normalizar habilitaciones
function normalizarHabilitaciones(habilitaciones) {
    if (!habilitaciones) return [];

    const eventos = [];

    if (habilitaciones.vtv) {
        eventos.push({
            tipo: "VTV",
            vigente: habilitaciones.vtv.vigente,
            fechaVencimiento: habilitaciones.vtv.vence
        });
    }

    if (habilitaciones.seguro) {
        eventos.push({
            tipo: "Seguro",
            vigente: habilitaciones.seguro.vigente,
            fechaVencimiento: habilitaciones.seguro.vence,
            detalle: `${habilitaciones.seguro.compania} · Póliza ${habilitaciones.seguro.poliza}`
        });
    }

    if (habilitaciones.habilitacionTransporte) {
        eventos.push({
            tipo: "Habilitación CNRT",
            vigente: habilitaciones.habilitacionTransporte.vigente,
            fechaVencimiento: habilitaciones.habilitacionTransporte.vence,
            organismo: habilitaciones.habilitacionTransporte.organismo
        });
    }

    if (habilitaciones.extintor) {
        eventos.push({
            tipo: "Extintor",
            vigente: habilitaciones.extintor.vigente,
            fechaVencimiento: habilitaciones.extintor.vence
        });
    }

    if (habilitaciones.tacografo) {
        eventos.push({
            tipo: "Tacógrafo",
            vigente: habilitaciones.tacografo.funcionando,
            fecha: habilitaciones.tacografo.ultimaCalibracion,
            detalle: "Última calibración"
        });
    }

    return eventos;
}


function renderReporteCard(reporte) {
    const card = document.createElement("div");
    card.className = "bg-white p-4 rounded shadow border-l-4 border-blue-500";

    card.innerHTML = `
        <div class="flex justify-between text-sm text-gray-500 mb-1">
            <span>${reporte.fecha}</span>
            <span class="font-semibold">REPORTE</span>
        </div>

        <p class="text-gray-800">${reporte.detalle}</p>
    `;

    return card;
}

init();
