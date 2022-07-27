import 'leaflet/dist/leaflet.css'
import '../../css/app.css'
import '../../scss/common.scss'
import '../../scss/sidebar.scss'
import '../../scss/legend.scss'
import '../../scss/interface.scss'

import 'leaflet'
import {Utils} from "./Utils";
import {Events} from "./Events";


let map = Utils.initializeMapWithBaseStyles()
Utils.getHotspots(map,Utils.getPolygonFromBounds(map.getBounds()))
Events.mapEvents(map)
Events.sidebarEvents()
document.querySelector('body').style.visibility='visible'
