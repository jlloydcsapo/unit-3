window.onload = setMap();

function setMap(){

    var height = 700;
    var width = 1250;

    console.log(height);
    console.log(width);

    var map = d3.select('#map-container')
        .append('svg')
        .attr('class', 'map')
        .attr('width', width)
        .attr('height', height);

    var projection = d3.geoAlbersUsa()
        .scale(1200)
        .translate([width / 2, height / 2]);

    console.log(projection);
        
    var path = d3.geoPath()
        .projection(projection);

    console.log(path)
    
    var promises = [d3.csv("data/state_econ_data.csv"),
                    d3.json("data/states_topo.topojson")
                ];

    Promise.all(promises).then(callback);

    function callback(data) {
        var csvData = data[0],
            states = data[1];
        
        //translate topoJSON to geoJSON
        var us_states_topo = topojson.feature(states, states.objects.us_states);
        var us_states_features = us_states_topo.features;
        console.log(us_states_topo);
        console.log(us_states_features);

        console.log(path);
        var us_states = map.selectAll('.states')
            .data(us_states_features)
            .enter()
            .append("path")
            .attr('class', function(d) {
                return "states " + d.properties.NAME;
            })
            .attr('d', path);
    };
}