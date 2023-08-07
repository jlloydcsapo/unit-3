(function() {

var attrArray = ['GINI_INDEX','INCOME_PER_CAPITA','GDP_PER_CAPITA','POVERTY_PERCENT','COST_OF_LIVING_INDEX'];
var expressed = attrArray[0];
window.onload = setMap();

function setMap(){

    var height = window.innerHeight *.65;
    var width = window.innerWidth 

    console.log(width);

    var map = d3.select('#map-container')
        .append('svg')
        .attr('class', 'map')
        .attr('width', width)
        .attr('height', height);
    
    var promises = [d3.csv("data/state_data.csv"),
                    d3.json("data/states_topo.topojson")
                ];

    Promise.all(promises).then(callback);

    function callback(data) {
        var csvData = data[0],
            states = data[1];

        console.log('data: ' + csvData);

        var projection = d3.geoAlbersUsa()
        .scale(1200)
        .translate([width / 2, height / 2]);

        var path = d3.geoPath()
        .projection(projection);
        
        //translate topoJSON to geoJSON
        var us_states_features = convertTopoToGeo(states);
        
        //join data
        us_states_features = joinData(us_states_features,csvData);
        
        var colorScale = createColorScale(csvData);
        
        //add enumeration units to map
        drawStates(us_states_features, map, path, colorScale);

        //add coordinated visualization 
        setChart(csvData, colorScale);
    };   
};

//set chart
function setChart(data, colorScale) {
    var chartHeight = window.innerHeight * .25;
    var chartWidth = window.innerWidth * .97

    const marginRight = 20;
    const marginBottom = 50;
    const marginLeft = 20;
    const radius = 9.5;
    const padding = 1.5;

    //create linear scale 
    var x = d3.scaleLinear()
        .domain(d3.extent(data, d => d[expressed]))
        .range([marginLeft, chartWidth - marginRight]);


    const svg = d3.select("#chart-container")
        .append("svg")
        .attr("width", chartWidth)
        .attr("height", chartHeight)
        .attr("viewBox", [0, 0, chartWidth, chartHeight])
  
    svg.append("g")
        .attr("class", 'axis')
        .attr("transform", `translate(0,${chartHeight - marginBottom})`)
        .style("font-size", 15)
        .style("font-weight", 600)
        .call(d3.axisBottom(x).tickSizeOuter(0));

    svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "middle")
        .attr("x", chartWidth/2)
        .attr("y", chartHeight - 5 )
        .text(expressed)
        .style("font-size", 15)
        .style("font-weight", 600);

    var bees = svg.append("g")
        .selectAll()
        .data(dodge(data, {radius: radius * 2 + padding, x: d => x(d[expressed])}))
        .join("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => chartHeight - marginBottom - radius - padding - d.y)
        .attr("r", radius)
        .attr("fill", function(d) {
            return colorScale(d.data[expressed]);
        })
        .append("text")
        .attr("x", d => d.x)
        .attr("y", d => chartHeight - marginBottom - radius - padding - d.y)
        .attr("fill", "#000")
        .attr("text-anchor", "middle")
        .text(d => d.data.ABBR)

    
    return bees.node();
};

//dodge placement function for beeswarm - https://observablehq.com/@d3/beeswarm/2
function dodge(data, {radius = 1, x = d => d} = {}) {
    const radius2 = radius ** 2;
    const circles = data.map((d, i, data) => ({x: +x(d, i, data), data: d})).sort((a, b) => a.x - b.x);
    console.log(circles);
    const epsilon = 1e-3;
    let head = null, tail = null;
  
    // Returns true if circle ⟨x,y⟩ intersects with any circle in the queue.
    function intersects(x, y) {
      let a = head;
      while (a) {
        if (radius2 - epsilon > (a.x - x) ** 2 + (a.y - y) ** 2) {
          return true;
        }
        a = a.next;
      }
      return false;
    }
  
    // Place each circle sequentially.
    for (const b of circles) {
  
      // Remove circles from the queue that can’t intersect the new circle b.
      while (head && head.x < b.x - radius2) head = head.next;
  
      // Choose the minimum non-intersecting tangent.
      if (intersects(b.x, b.y = 0)) {
        let a = head;
        b.y = Infinity;
        do {
          let y = a.y + Math.sqrt(radius2 - (a.x - b.x) ** 2);
          if (y < b.y && !intersects(b.x, y)) b.y = y;
          a = a.next;
        } while (a);
      }
  
      // Add b to the queue.
      b.next = null;
      if (head === null) head = tail = b;
      else tail = tail.next = b;
    }
  
    return circles;
};

//create color scale
function createColorScale(data) {
    console.log('creating color scale...');

    var colorClasses = [
        "#95d5b2",
        "#74c69d",
        "#52b788",
        "#40916c",
        "#2d6a4f"
    ];

    var colorScale = d3.scaleThreshold().range(colorClasses);

    var domainArray = [];

    for (var i = 0; i < data.length; i++) {
        var val = parseFloat(data[i][expressed]);
        console.log(i, val);
        domainArray.push(val);
    };

    console.log(domainArray);

    var clusters = ss.ckmeans(domainArray,5);
    console.log(clusters);

    domainArray = clusters.map(function(d) {
        return d3.min(d);
    });
    console.log(domainArray);

    domainArray.shift();
    console.log('shifted domain array: ' + domainArray);

    colorScale.domain(domainArray);

    return colorScale;
};

//translate TOPOJSON to GEOJSON
function convertTopoToGeo(states){
    var us_states_topo = topojson.feature(states, states.objects.us_states);
    var us_states_features = us_states_topo.features;
    console.log(us_states_topo);
    console.log(us_states_features);
    return us_states_features;
};

function joinData(us_states_features, csvData) {
    for (var i = 0; i < csvData.length; i++ ) {
        var csv_state = csvData[i];
        var csv_key = csv_state.GEO_ID;

        var key_found = false;

        for(var j = 0; j < us_states_features.length; j++) {
            var state_json = us_states_features[j].properties;
            var state_json_key = state_json.GEO_ID;
            

            if (csv_key == state_json_key) {
                key_found = true;

                console.log("data for key " + csv_key + " joined");
                attrArray.forEach(function(attr) {
                    var val = parseFloat(csv_state[attr]);
                    state_json[attr] = val;
                })    
            } 

        };

        //log keys for which data is not found
        if (!key_found) {
            console.log("data for key " + csv_key + " NOT FOUND");
        };
    };

    return us_states_features;
};

function drawStates(us_states_features, map, path, colorScale) {
    map.selectAll('.states')
        .data(us_states_features)
        .enter()
        .append("path")
        .attr('class', function(d) {
            return "states " + d.properties.NAME;
        })
        .attr('d', path)
        .style('fill', function(d) {
            return colorScale(d.properties[expressed]);
        });
};  
})();