//menu
const btn = document.getElementById("btn-menu");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

btn.addEventListener("click", () => {
    sidebar.classList.toggle("-translate-x-full");
    overlay.classList.toggle("hidden");
});

overlay.addEventListener("click", () => {
    sidebar.classList.add("-translate-x-full");
    overlay.classList.add("hidden");
});