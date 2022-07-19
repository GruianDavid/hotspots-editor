import pin from '@/../images/pin.svg'
import {Events} from "./Events";
import {Util} from "leaflet/dist/leaflet-src.esm";

export class Utils {
    static pin = pin
    static initializeMapWithBaseStyles(){
        let osmDefault = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            noWrap: true,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors | <a href="https://operations.osmfoundation.org" target="_blank">Nominatim</a>'
        })
        let jDark = L.tileLayer('https://{s}.tile.jawg.io/jawg-dark/{z}/{x}/{y}@2x.png?access-token=0kpZMkHOkyArRzKWglHXvakWmYghOlHak7yNbNpjLcQ7gpX38p4c2d99bnW7xHZt&lang=en', {
            maxZoom: 19,
            noWrap: true,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors | <a href="https://operations.osmfoundation.org" target="_blank">Nominatim</a>'
        });
        let jLight = L.tileLayer('https://{s}.tile.jawg.io/jawg-light/{z}/{x}/{y}@2x.png?access-token=0kpZMkHOkyArRzKWglHXvakWmYghOlHak7yNbNpjLcQ7gpX38p4c2d99bnW7xHZt&lang=en', {
            maxZoom: 19,
            noWrap: true,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors | <a href="https://operations.osmfoundation.org" target="_blank">Nominatim</a>'
        });
        let baseLayers = {
            "Default": osmDefault,
            "JAWG Dark": jDark,
            "JAWG Light": jLight
        };
        let map = L.map('map', {
            minZoom: 3,
            zoomControl: false,
            layers: [jDark]
        }).setView([0, 0], 3);
        L.control.zoom({position: 'bottomright'}).addTo(map);
        L.control.layers(baseLayers,{},{position:'bottomright'}).addTo(map);
        L.control.scale().addTo(map); // add a scale to the map
        map.setMaxBounds([
            [-90, -180],
            [90, 180]
        ]); //set bounds of drag action
        map.doubleClickZoom.disable();
        return map
    }

    static createSimpleIcon(size =1, iconUrl = Utils.pin) {
        return new L.Icon({
            iconUrl: iconUrl,
            iconSize: [34*size, 48*size],
            iconAnchor: [17*size, 48*size],
            popupAnchor: [0, -42*size],
        });
    }

    static setLayerGroupStyleFilter(layerGroup,filter){
        Object.values(layerGroup._layers).forEach(layer =>{
            layer._icon.style.filter = filter
        })
    }

    static globalClickEvent(match){
        document.addEventListener('click',e => {
            if (e.target.matches(match)){
                console.log(e)
            }
        })
    }

    static getHotspots(map,polygon) {
        const async = true;
        const bbox = JSON.stringify(polygon.toGeoJSON().geometry);
        const url = "/heatpoints?bbox="+bbox
        let httpRequest = new XMLHttpRequest()
        httpRequest.open("GET", url, async);
        httpRequest.send();
        Utils.toggleLoader(true);
        httpRequest.onreadystatechange = (e) => {
            if (httpRequest.readyState === 4 && httpRequest.status === 200) {
                JSON.parse(httpRequest.response).forEach(response => {
                    let marker = new L.marker(JSON.parse(response.coordinates), {
                        draggable:'true',
                        icon: Utils.createSimpleIcon()
                    })
                    let layerGroup = new L.layerGroup()
                    marker.data={id:response.id}
                    layerGroup.addLayer(marker);
                    map.addLayer(layerGroup);
                    Events.setMarkerEvents(marker, layerGroup);
                })
                Utils.toggleLoader(false);
            }
        }
    }

    static getWays(map,polygon) {
        const async = true;
        const bbox = JSON.stringify(polygon.toGeoJSON().geometry);
        const url = "/ways?bbox="+bbox
        let httpRequest = new XMLHttpRequest()
        httpRequest.open("GET", url, async);
        httpRequest.send();
        Utils.toggleLoader(true);
        httpRequest.onreadystatechange = (e) => {
            if (httpRequest.readyState === 4 && httpRequest.status === 200) {
                JSON.parse(httpRequest.response).forEach(way => {
                    let wayCoordinates = JSON.parse(way.coordinates);
                    L.polyline(wayCoordinates, {color: "#42B98B", weight: 3 , opacity: 1}).addTo(map);
                })
                Utils.toggleLoader(false);
            }
        }
    }

    //Get geojson geometry from bbox
    static getPolygonFromBounds(bounds){
        let outerBoundsLatLngs = [
            bounds.getSouthWest(),
            bounds.getNorthWest(),
            bounds.getNorthEast(),
            bounds.getSouthEast()
        ];
        return new L.Polygon(outerBoundsLatLngs)
    }

    static displayMarkerData(newMarker, oldMarker = newMarker){
        const oldMarkerCoords = oldMarker.getLatLng();
        document.getElementById('oldCoordinates').innerText = oldMarkerCoords.lat + ", " + oldMarkerCoords.lng;
        const newMarkerCoords = newMarker.getLatLng();
        document.getElementById('newCoordinates').innerText = newMarkerCoords.lat + ", " + newMarkerCoords.lng;
    }

    static async updateMarker(marker){
        const url = '/heatpoints/update/'+marker.data.id;
        const data = {coords: marker.getLatLng()}
        Utils.toggleLoader(true)
        await fetch(url, {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json, text-plain, */*",
                "X-Requested-With": "XMLHttpRequest",
                "X-CSRF-TOKEN": document.querySelector('input[name="_token"]').value
            },
            method: 'post',
            credentials: "same-origin",
            body: JSON.stringify(data)
        })
    }

    static async deleteMarker(marker){
        const url = '/heatpoints/delete/'+marker.data.id;
        Utils.toggleLoader(true)
        await fetch(url, {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json, text-plain, */*",
                "X-Requested-With": "XMLHttpRequest",
                "X-CSRF-TOKEN": document.querySelector('input[name="_token"]').value
            },
            method: 'post',
            credentials: "same-origin"
        })
    }

    static storeMarker(map, marker){
        const url = '/heatpoints';
        const data = {coords: marker.getLatLng()}
        Utils.toggleLoader(true)
        fetch(url, {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json, text-plain, */*",
                "X-Requested-With": "XMLHttpRequest",
                "X-CSRF-TOKEN": document.querySelector('input[name="_token"]').value
            },
            method: 'post',
            credentials: "same-origin",
            body: JSON.stringify(data)
        }).then((response) => {
            Utils.toggleLoader(false)
            if (response.ok){
                marker.data = {id:response.id}
            }else{
                map.removeLayer(marker)
                Events.sidebarToggle(false)
            }
        })
    }

    //Display or hide loader
    static toggleLoader(status){
        let loader = document.getElementById('loader');
        status ? loader.classList.add('visible') : loader.classList.remove('visible');
    }

}
