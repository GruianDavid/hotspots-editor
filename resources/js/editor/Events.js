import {Utils} from "./Utils";

export class Events{
    static changedStyle = "invert(100%)"
    static changedFocusedStyle = Events.changedStyle + " drop-shadow(1px 1px 0 yellow) drop-shadow(-1px 1px 0 yellow)"
    static ghostMarker = null
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
            marker._icon.style.filter = Events.changedStyle;
            Events.activeMarker = marker;
            Events.activeLayer = layerGroup;
            Utils.displayMarkerData(marker);
            Events.sidebarToggle(true);
            Utils.storeMarker(map, marker)
        });
        map.on('zoomend dragend', () => {
            console.log(map.getZoom())
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
            if (Events.activeMarker !== null){
                Events.activeMarker._icon.style.filter = Events.changedStyle
            }
            Events.ghostMarker = ghost
            Events.activeMarker = marker
            Events.activeLayer = layerGroup
        });
        marker.on('dragend', e => {
            Utils.setLayerGroupStyleFilter(layerGroup,Events.changedStyle)
            Utils.displayMarkerData(marker,Events.ghostMarker);
            Events.sidebarToggle(true)
            Events.activeMarker._icon.style.filter = Events.changedFocusedStyle
        });
        marker.on('click', e => {
            if (Object.values(Events.activeLayer?._layers || {}).length >= 2){
                if (Object.values(layerGroup._layers).length >= 2){
                    Events.activeMarker._icon.style.filter = Events.changedStyle
                    Events.activeMarker = marker
                    Events.activeMarker._icon.style.filter = Events.changedFocusedStyle
                    Events.activeLayer = layerGroup
                    Events.sidebarToggle(true)
                }
                return
            }
            if (Events.activeMarker !== null){
                Events.activeMarker._icon.style.filter = ""
            }
            marker._icon.style.filter = Events.changedFocusedStyle
            Events.activeMarker = marker
            Events.activeLayer = layerGroup
            Utils.displayMarkerData(marker);
            Events.sidebarToggle(true)
        })
        marker.on('confirm-layers', e =>{
            Utils.updateMarker(marker).then(()=>{
                marker._icon.style.filter = ""
                layerGroup.clearLayers();
                layerGroup.addLayer(marker)
                ghost = null;
                Utils.toggleLoader(false)
            })
        })
        marker.on('remove-layers', e =>{
            Utils.deleteMarker(marker).then(()=>{
                layerGroup.clearLayers();
                ghost = null;
                Utils.toggleLoader(false)
            })
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

    static sidebarEvents(){
        document.getElementById('markerReset').addEventListener("click",()=>{
            Events.activeMarker.fire('reset-layers')
            Events.sidebarToggle(false)
        })
        document.getElementById('markerConfirm').addEventListener("click",()=>{
            Events.activeMarker.fire('confirm-layers')
            Events.sidebarToggle(false)
        })
        document.getElementById('markerDelete').addEventListener("click",()=>{
            Events.activeMarker.fire('remove-layers')
            Events.sidebarToggle(false)
        })
    }

    static sidebarToggle(shouldOpen){
        if (Events.activeMarker === null){return}
        const sidebar = document.getElementById('sidebar');
        if (shouldOpen){
            sidebar.classList.add('opened');
            return
        }
        sidebar.classList.remove('opened');
        Events.activeMarker = null
        Events.activeLayer = null
    }
}
