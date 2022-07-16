import pin from '@/../images/pin.svg'

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

}
