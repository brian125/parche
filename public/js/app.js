import { OpenStreetMapProvider } from "leaflet-geosearch";
import asistencia from './asistencia';
import eliminarComentario from './eliminarComentario';

const lat = document.querySelector('#lat').value || 6.217;
const lng = document.querySelector('#lng').value || -75.567;
const direccion = document.querySelector('#direccion').value || '';
const map = L.map("map").setView([lat, lng], 15);

let markers = new L.featureGroup().addTo(map);
let marker;

const geocodeService = L.esri.Geocoding.geocodeService();

//Marker en Edición
if (lat && lng) {
    marker = new L.marker([lat,lng], {
        draggable: true,
        autoPan: true
    })
        .addTo(map)
        .bindPopup(direccion)
        .openPopup();

    markers.addLayer(marker);

    marker.on('moveend', function (e) {
        marker = e.target;
        const posicion = marker.getLatLng();
        map.panTo(new L.LatLng(posicion.lat, posicion.lng));

        geocodeService.reverse().latlng(posicion, 15).run(function (error, result) {
            llenarInputs(result);
            marker.bindPopup(result.address.LongLabel);
            
        })
    })
}

document.addEventListener("DOMContentLoaded", () => {
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    //Buscar la dirección
    const buscador = document.querySelector('#formbuscador');
    buscador.addEventListener('input', buscarDireccion);
});

function buscarDireccion(e) {
    if (e.target.value.length > 8) {
        markers.clearLayers();

        
        const provider = new OpenStreetMapProvider();

        provider.search({ query: e.target.value })
            .then(resultado => {

                geocodeService.reverse().latlng(resultado[0].bounds[0], 15).run(function (error, result) {
                    
                    llenarInputs(result);
                    map.setView(resultado[0].bounds[0], 15);
                    marker = new L.marker(resultado[0].bounds[0], {
                        draggable: true,
                        autoPan: true
                    })
                        .addTo(map)
                        .bindPopup(resultado[0].label)
                        .openPopup();

                    markers.addLayer(marker);

                    marker.on('moveend', function (e) {
                        marker = e.target;
                        const posicion = marker.getLatLng();
                        map.panTo(new L.LatLng(posicion.lat, posicion.lng));

                        geocodeService.reverse().latlng(posicion, 15).run(function (error, result) {
                            llenarInputs(result);
                            marker.bindPopup(result.address.LongLabel);
                            
                        })
                    })
                })

            })
    }
}

function llenarInputs(resultado){
    document.querySelector('#direccion').value = resultado.address.Address || '';
    document.querySelector('#ciudad').value = resultado.address.City || '';
    document.querySelector('#estado').value = resultado.address.Region || '';
    document.querySelector('#pais').value = resultado.address.CountryCode || '';
    document.querySelector('#lat').value = resultado.latlng.lat || '';
    document.querySelector('#lng').value = resultado.latlng.lng || '';
}