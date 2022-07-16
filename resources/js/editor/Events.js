import {Utils} from "./Utils";

export class Events{
    static activeMarker = null
    static activeLayer = null
    static mapEvents(map){
        map.on('dblclick', (e) => {
            if (Events.activeMarker !== null){return}
            let layerGroup = new L.layerGroup()
            let marker = new L.marker(e.latlng, {
                draggable:'true',
                icon: Utils.createSimpleIcon()
            })
            layerGroup.addLayer(marker);
            map.addLayer(layerGroup);
            Events.setMarkerEvents(marker, layerGroup);
            marker._icon.style.filter = "invert(100%)";
            Events.activeMarker = marker;
            Events.activeLayer = layerGroup;
            Events.sidebarToggle(true);
        });
    }

    static setMarkerEvents(marker,layerGroup){
        let ghost = null;
        marker.on('dragstart', e => {
            if (Object.values(layerGroup._layers).length >= 2){ return }
            ghost = new L.marker(e.sourceTarget._latlng, {
                icon: Utils.createSimpleIcon(),
                opacity: 0.5
            });
            layerGroup.addLayer(ghost);
            Events.activeMarker = marker
            Events.activeLayer = layerGroup
        });
        marker.on('dragend', e => {
            Utils.setLayerGroupStyleFilter(layerGroup,"invert(100%)")
            Events.sidebarToggle(true)
        });
        marker.on('click', e => {
            if (Object.values(Events.activeLayer?._layers || {}).length >= 2){ return }
            if (Events.activeMarker !== null){
                Events.activeMarker._icon.style.filter = ""
            }
            marker._icon.style.filter = "invert(100%)"
            Events.activeMarker = marker
            Events.activeLayer = layerGroup
            Events.sidebarToggle(true)
        })
        marker.on('confirm-layers', e =>{
            layerGroup.clearLayers();
            layerGroup.addLayer(marker)
            ghost = null;
        })
        marker.on('remove-layers', e =>{
            layerGroup.clearLayers();
            ghost = null;
        })
        marker.on('reset-layers', e =>{
            layerGroup.clearLayers();
            if (ghost === null){
                layerGroup.addLayer(marker)
                return
            }
            layerGroup.addLayer(marker.setLatLng(ghost.getLatLng()))
        })
    }

    static sidebarEvents(map){

        document.getElementById('markerReset').addEventListener("click",()=>{
            Events.activeMarker.fire('reset-layers')
            Events.sidebarToggle(false)
        })
        document.getElementById('markerConfirm').addEventListener("click",()=>{
            Events.activeMarker._icon.style.filter = ""
            Events.activeMarker.fire('confirm-layers')
            Events.sidebarToggle(false)
        })
        document.getElementById('markerDelete').addEventListener("click",()=>{
            Events.activeMarker.fire('remove-layers')
            Events.sidebarToggle(false)
        })
    }

    static sidebarToggle(state){
        if (Events.activeMarker === null){return}
        const sidebar = document.getElementById('sidebar');
        if (state){
            sidebar.classList.add('opened');
            return
        }
        sidebar.classList.remove('opened');
        Events.activeMarker = null
        Events.activeLayer = null
    }
}
