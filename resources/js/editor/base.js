import 'leaflet/dist/leaflet.css'
import '../../css/app.css'
import '../../scss/common.scss'
import '../../scss/sidebar.scss'

import 'leaflet'
import {Utils} from "./Utils";
import {Events} from "./Events";


let map = Utils.initializeMapWithBaseStyles()

Events.mapEvents(map)
Events.sidebarEvents(map)

