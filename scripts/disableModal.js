document.addEventListener("DOMContentLoaded", () => {

  // Delegación global (funciona aunque agregues botones dinámicamente)
  document.body.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-disabled-feature]");
    if (!btn) return;

    e.preventDefault();

    mostrarModal();
  });

});

function mostrarModal() {
  const modal = document.createElement("div");

  modal.className = `
    fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50
  `;

  modal.innerHTML = `
    <div class="bg-white rounded-lg shadow-lg p-6 w-[350px] text-center animate-fadeIn">
      
      <h2 class="text-xl font-bold text-red-600 mb-3">
        🚫 Funcionalidad desactivada
      </h2>

      <p class="text-gray-600 mb-5">
        Esta función no está disponible.
      </p>

      <button class="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 cerrar-modal">
        Entendido
      </button>

    </div>
  `;

  modal.querySelector(".cerrar-modal").addEventListener("click", () => {
    modal.remove();
  });

  document.body.appendChild(modal);
}