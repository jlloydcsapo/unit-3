var cityPop = [
    { 
        city: 'Madison',
        population: 233209
    },
    {
        city: 'Milwaukee',
        population: 594833
    },
    {
        city: 'Green Bay',
        population: 104057
    },
    {
        city: 'Superior',
        population: 27244
    }
];

var dataArray = [10,20,30,40,50];

//SVG dimension variables
var w = 900, h = 500;

var x = d3.scaleLinear() 
    .range([90, 750]) 
    .domain([0, 3]); 

var minPop = d3.min(cityPop, function(d) {
    return d.population;
});

var maxPop = d3.max(cityPop, function(d) {
    return d.population;
});

var y = d3.scaleLinear()
.range([450, 50])
.domain([0, 700000]);

var color = d3.scaleLinear()
.range([
    "#FDBE85",
    "#D94701"
])
.domain([
    minPop, 
    maxPop
]);

var yAxis = d3.axisLeft(y);

 //Example 1.2 line 1...container block
 var container = d3.select("body") //get the <body> element from the DOM
    .append("svg") //put a new svg in the body
    .attr("width", w) //assign the width
    .attr("height", h) //assign the height
    .attr("class", "container") 
    .style("background-color", "rgba(0,0,0,0.2)");

var title = container.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("x", 450)
        .attr("y", 30)
        .text("City Populations");

var axis = container.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(50, 0)")
    .call(yAxis);

//innerRect block
var innerRect = container.append("rect")
    .datum(400) //put a new rect in the svg
    .attr("width", function(d) {
        return d * 2;
    }) //rectangle width
    .attr("height", function(d){
        return d;
    }) //rectangle height
    .attr("class", "innerRect")
    .attr("x", 50)
    .attr("y", 50)
    .style("fill", "#FFFFFF");

var circles = container.selectAll(".circles")
    .data(cityPop)
    .enter()
    .append("circle")
    .attr("class", "circles") //apply a class name to all circles
    .attr("id", function(d){
        return d.city;
    })
    .attr("r", function(d){
        //calculate the radius based on population value as circle area
        var area = d.population * 0.01;
        return Math.sqrt(area/Math.PI);
    })
    .attr("cx", function(d, i){
        //use the index to place each circle horizontally
        return x(i)
    })
    .attr("cy", function(d){
        //subtract value from 450 to "grow" circles up from the bottom instead of down from the top of the SVG
        return y(d.population);
    })
    .style("fill", function(d, i){ //add a fill based on the color scale generator
        return color(d.population);
    })
    .style("stroke", "#000"); //black circle stroke

var labels = container.selectAll(".labels")
    .data(cityPop)
    .enter()
    .append("text")
    .attr("class", "labels")
    .attr("text-anchor", "left")
    .attr("x", function(d,i){
        //horizontal position to the right of each circle
        return x(i) + Math.sqrt(d.population * 0.01 / Math.PI) + 5;
    })
    .attr("y", function(d){
        //vertical position centered on each circle
        return y(d.population);
    });

     //first line of label
var nameLine = labels.append("tspan")
    .attr("class", "nameLine")
    .attr("x", function(d,i){
        //horizontal position to the right of each circle
        return x(i) + Math.sqrt(d.population * 0.01 / Math.PI) + 5;
    })
    .text(function(d){
        return d.city;
    });

var format = d3.format(",");

    //Example 3.16 line 1...second line of label
var popLine = labels.append("tspan")
    .attr("class", "popLine")
    .attr("x", function(d,i){
       return x(i) + Math.sqrt(d.population * 0.01 / Math.PI) + 5;
     })
    .attr("dy", "15") //vertical offset
    .text(function(d){
       return "Pop. " + format(d.population); //use format generator to format numbers
    });
