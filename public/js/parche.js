document.addEventListener("DOMContentLoaded", () => {
    if (document.querySelector("#ubicacion-parche")) {
        mostrarMapa();
    }
});

function mostrarMapa() {

    const lat = document.querySelector('#lat').value;
    const lng = document.querySelector('#lng').value;
    const direccion = document.querySelector('#direccion').value;


    var map = L.map("ubicacion-parche").setView([lat, lng], 18);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    L.marker([lat, lng])
        .addTo(map)
        .bindPopup(direccion)
        .openPopup();
}
