(function() {
    const lat = 4.9312669;
    const lng = -74.0240202;
    const mapa = L.map('mapa').setView([lat, lng ], 13);
    let marker;

    // utilizar provider y geocoder
    const geocodeService = L.esri.Geocoding.geocodeService();

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);
    //pin 
    marker = new L.marker([lat, lng], {
        draggable: true,
        autoPan: true
    }).addTo(mapa);
    // detectar movimiento del marker
    marker.on('moveend', function(e) {
        marker = e.target;
        const posicion = marker.getLatLng();
        mapa.panTo(new L.LatLng(posicion.lat, posicion.lng));

        // obtener la direccion al mover el marker
        geocodeService.reverse().latlng(posicion, 13).run(function(error, result) {
            // console.log(result);
            marker.bindPopup(result.address.Match_addr).openPopup();

            // llenar los campos de dirección
            document.querySelector(".calle").textContent = result?.address?.Address || '';
            document.querySelector("#calle").value = result?.address?.Address || '';
            document.querySelector("#lat").value = result?.latlng?.lat || '';
            document.querySelector("#lng").value = result?.latlng?.lng || '';
        });
    });
})()