async function init() {
    try {
        const res = await fetch("../flota.json");
        const data = await res.json();

        renderDashboard(data.buses, data.diagrama);

    } catch (error) {
        console.error("Error cargando estados generales:", error);
    }
}

function renderDashboard(buses, diagrama) {
    const operativas = buses.filter(b => b.estado === "activa").length;
    const taller = buses.filter(b => b.estado === "mantenimiento").length;
    const fuera = buses.filter(b => b.estado === "fuera_de_servicio").length;
    const baja = buses.filter(b => b.estado === "baja_definitiva").length;

    const salen = operativas; // MVP
    const faltan = Math.max(diagrama.unidadesNecesariasHoy - salen, 0);

    document.getElementById("operativas").textContent = operativas;
    document.getElementById("salen").textContent = salen;
    document.getElementById("taller").textContent = taller;
    document.getElementById("fuera").textContent = fuera;
    document.getElementById("baja").textContent = baja;
    document.getElementById("faltan").textContent = faltan;
}

init();

window.irAEstado = function (estado) {
    window.location.href = `./estadoSelecionado/estadoSelecionado.html?estado=${estado}`;
};