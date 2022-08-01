<div class="map-legend collapsed" id="legend">
    <div class="map-legend-head" id="legendHead">Config</div>
    <div class="map-legend-body">
        <div class="map-legend-list" id="mapLegendList">
            <li class="map-legend-list-item">
                <span class="item-name">
                    <span>Display ways</span>
                </span>
                <span class="item-name">
                    <div class="toggle-switch">
                        <input type="checkbox">
                        <span class="slider"></span>
                    </div>
                </span>
            </li>
            <li class="map-legend-list-item">
                <span class="item-name">Load lines in view (zoom level)</span>
            </li>
        </div>
    </div>
</div>


<script>
    let legend = document.getElementById('legend');
    let legendHead = document.getElementById('legendHead');

    legendHead.addEventListener('click', event => {
        legend.classList.toggle('collapsed');
    });
</script>
