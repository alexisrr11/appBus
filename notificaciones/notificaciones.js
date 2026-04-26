async function cargarAlertas() {

            const container = document.getElementById("alertasContainer");

            try {

                // Carga el JSON local
                const res = await fetch("../flota.json");
                const data = await res.json();

                const buses = data.buses;

                container.innerHTML = "";

                const alertas = obtenerAlertas(buses);

                if (alertas.length === 0) {

                    container.innerHTML = `
                        <div class="bg-white p-5 rounded-xl shadow">
                            No hay alertas activas.
                        </div>
                    `;

                    return;
                }

                alertas.forEach(alerta => {

                    const div = document.createElement("div");

                    let colorClass = "bg-yellow-600";

                    if (alerta.color === "red") {
                        colorClass = "bg-red-700";
                    }

                    if (alerta.color === "darkred") {
                        colorClass = "bg-red-900";
                    }

                    div.className = `
                        ${colorClass}
                        text-white
                        p-5
                        rounded-xl
                        shadow-md
                        flex
                        flex-col
                        gap-2
                    `;

                    div.innerHTML = `
                        <div class="flex justify-between items-center font-bold text-lg">

                            <span>
                                Unidad ${alerta.interno}
                            </span>

                            <span class="uppercase text-sm bg-black/20 px-3 py-1 rounded-full">
                                ${alerta.prioridad}
                            </span>

                        </div>

                        <div class="text-base">
                            ${alerta.mensaje}
                        </div>

                        <div class="text-sm text-white/90">
                            Patente: ${alerta.patente}
                        </div>

                        <div class="text-sm text-white/90">
                            Tipo: ${alerta.tipo}
                        </div>

                        ${alerta.vence ? `
                            <div class="text-sm text-white/90">
                                Vence: ${alerta.vence}
                            </div>
                        ` : ""}

                        ${alerta.diasRestantes !== null ? `
                            <div class="text-sm text-white/90">
                                Días restantes: ${alerta.diasRestantes}
                            </div>
                        ` : ""}
                    `;

                    container.appendChild(div);

                });

            } catch (error) {

                console.error(error);

                container.innerHTML = `
                    <div class="bg-white p-5 rounded-xl shadow text-red-600">
                        Error al cargar alertas.
                    </div>
                `;
            }
        }

        function calcularDiasRestantes(fecha) {

            if (!fecha) return null;

            const hoy = new Date();

            const vencimiento = new Date(fecha);

            const diferencia = vencimiento - hoy;

            return Math.ceil(
                diferencia / (1000 * 60 * 60 * 24)
            );
        }

        function crearAlerta(bus, tipo, vence, diasRestantes) {

            if (diasRestantes === null || diasRestantes > 30) {
                return null;
            }

            let prioridad = "media";
            let color = "yellow";

            if (diasRestantes < 0) {

                prioridad = "critica";
                color = "darkred";

            } else if (diasRestantes <= 7) {

                prioridad = "alta";
                color = "red";
            }

            return {
                interno: bus.interno,
                patente: bus.patente,
                tipo,
                vence,
                diasRestantes,
                prioridad,
                color,
                mensaje:
                    diasRestantes < 0
                        ? `El ${tipo} está vencido`
                        : `El ${tipo} vence en ${diasRestantes} días`
            };
        }

        function obtenerAlertas(buses) {

            const alertas = [];

            buses.forEach(bus => {

                const docs = [

                    {
                        tipo: "VTV",
                        vence: bus.habilitaciones?.vtv?.vence
                    },

                    {
                        tipo: "Seguro",
                        vence: bus.habilitaciones?.seguro?.vence
                    },

                    {
                        tipo: "Habilitación",
                        vence: bus.habilitaciones?.habilitacionTransporte?.vence
                    },

                    {
                        tipo: "Extintor",
                        vence: bus.habilitaciones?.extintor?.vence
                    }

                ];

                docs.forEach(doc => {

                    if (!doc.vence) return;

                    const dias =
                        calcularDiasRestantes(doc.vence);

                    const alerta =
                        crearAlerta(
                            bus,
                            doc.tipo,
                            doc.vence,
                            dias
                        );

                    if (alerta) {
                        alertas.push(alerta);
                    }

                });

                // mantenimiento urgente

                if (
                    bus.kmDesdeUltimoService >=
                    bus.proximoMantenimientoKm
                ) {

                    alertas.push({

                        interno: bus.interno,

                        patente: bus.patente,

                        tipo: "Mantenimiento",

                        vence: null,

                        diasRestantes: null,

                        prioridad: "critica",

                        color: "darkred",

                        mensaje:
                            "Mantenimiento urgente por kilometraje excedido"

                    });

                }

            });

            return alertas;
        }

        cargarAlertas();