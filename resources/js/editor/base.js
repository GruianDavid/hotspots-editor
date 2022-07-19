import 'leaflet/dist/leaflet.css'
import '../../css/app.css'
import '../../scss/common.scss'
import '../../scss/sidebar.scss'

import 'leaflet'
import {Utils} from "./Utils";
import {Events} from "./Events";


let map = Utils.initializeMapWithBaseStyles()
Utils.getHotspots(map,Utils.getPolygonFromBounds(map.getBounds()))
Events.mapEvents(map)
// todo enable on lower zoom levels
// Utils.getWays(map,Utils.getPolygonFromBounds(map.getBounds()))
Events.sidebarEvents()
document.querySelector('body').style.visibility='visible'
