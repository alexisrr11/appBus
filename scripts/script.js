export function toggleHidden(btn, contenedor) {
    btn.addEventListener("click", () => {
        contenedor.classList.toggle("hidden");
        btn.textContent = contenedor.classList.contains("hidden") ? "➕" : "➖";
    });
};