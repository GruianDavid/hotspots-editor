import pin from '@/../images/pin.svg'
import {Events} from "./Events";
import 'leaflet-bing-layer'

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
        let esri = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 19,
            noWrap: true,
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        });
        let mapBox = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoib2N0YXZmIiwiYSI6ImNrbXE2bjkwZTJsMWUycG56Z3NpcmZoaGoifQ.zYS6F-96nC4JaSRElctSxQ', {
            maxZoom: 19,
            noWrap: true,
            attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
            id: 'mapbox.satellite',
        })
        let bing = L.tileLayer.bing({
            bingMapsKey: "Ag-i53H7m1c8ZOV-WANqCm2_waL8dJ_IElY7FlKMNi0yqdO6vZ9EID9CF8MxI94u",
            maxNativeZoom: 18,
            maxZoom: 19
        })
        let baseLayers = {
            "Default": osmDefault,
            "JAWG Dark": jDark,
            "JAWG Light": jLight,
            "ESRI": esri,
            "MapBox": mapBox,
            "Bing": bing,
        };
        let getParams = new URLSearchParams(window.location.search);

        let map = L.map('map', {
            minZoom: 3,
            zoomControl: false,
            layers: [jDark]
        }).setView([getParams.get('clat')||20, getParams.get('clng')||10], Math.min(19,Math.max(getParams.get('zoom'),2)));
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

    static setGetParamsForMap(map){
        let getParams = new URLSearchParams(window.location.search);
        getParams.set('clat',map.getCenter().lat)
        getParams.set('clng',map.getCenter().lng)
        getParams.set('zoom',map.getZoom())
        window.history.replaceState({}, '', `${location.pathname}?${getParams}`);
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

    static existingWays = []
    static getWays(map,polygon) {
        const async = true;
        const bbox = JSON.stringify(polygon.toGeoJSON().geometry);
        const url = "/ways?bbox="+bbox+"&zoom="+map.getZoom()
        let httpRequest = new XMLHttpRequest()
        httpRequest.open("GET", url, async);
        httpRequest.send();
        Utils.toggleLoader(true);

        let receivedIndex = 0;
        httpRequest.onprogress = (e) => {
            if((httpRequest.readyState === 3 || httpRequest.readyState === 2) && httpRequest.status === 200) {
                //slice the response(Text) to show chunk by chunk
                let {chunk, initialChunkSize} = Utils.toJsonFormat(httpRequest.response.slice(receivedIndex));
                try{
                    if(chunk) { //not empty
                        let ways = JSON.parse(chunk)
                        ways.forEach(way => {
                            let wayCoordinates = JSON.parse(way.coordinates);
                            wayCoordinates = wayCoordinates.filter(way => !Utils.existingWays.find(exist => exist.coordinates === way.coordinates));
                            L.polyline(wayCoordinates, {interactive: false, color: "#DB4848", weight: 4 , opacity: 1}).addTo(map);

                        })
                        Utils.existingWays = [...Utils.existingWays, ...ways];
                        this.receivedIndex = this.receivedIndex + initialChunkSize;
                    }
                }catch (e) {
                    console.log(chunk) //for debug purposes on prod, as most errors happen there
                    console.error(e)
                }
            }
        };
        httpRequest.onreadystatechange = (e) => {
            if (httpRequest.readyState === 4 && httpRequest.status === 200) {
                Utils.toggleLoader(false);
            }
        }
    }

    static toJsonFormat(chunk){
        //error handling because the string returned through stream is not always a complete json file.
        if(chunk.slice(-1) !== ']' && chunk.length > 0){
            let chunkLimit = chunk.lastIndexOf('}')+1;
            chunk = chunk.substring(0,chunkLimit)+"]";
        }
        if(chunk.charAt(0) === ','){
            chunk = chunk.replace(",", "[");
        }
        const initialChunkSize = chunk.length;
        if(chunk.charAt(0) === '{'){
            chunk = "["+chunk;
        }
        return {'chunk': chunk.replaceAll("][", ","), 'initialChunkSize': initialChunkSize};
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
