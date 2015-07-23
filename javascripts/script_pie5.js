var width = 560;
var height = 560;
var radius = Math.min(width, height) / 2; 
var donutWidth = 75;    

var color = d3.scale.category20b();

var svg = d3.select(".chart")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", "translate(" + (width / 2) +  "," + (height / 2) + ")");

var arc = d3.svg.arc()
  .innerRadius(radius - donutWidth)
  .outerRadius(radius);

var pie = d3.layout.pie()
  .value(function(d) { return d.dollars; })
  .sort(null);

var tooltip = d3.select(".chart")
  .append("div")
  .attr("class", "tooltip");

tooltip.append("div")
  .attr("class", "candidate");

tooltip.append("div")
  .attr("class", "dollars");

tooltip.append("div")
  .attr("class", "percent");


d3.csv("candidates.csv", function(error, dataset) {
  dataset.forEach(function(d) {
    d.dollars = +d.dollars;
    d.enabled = true;
  });

var path = svg.selectAll("path")
  .data(pie(dataset))
  .enter()
  .append("path")
  .attr("d", arc)
  .attr("fill", function(d, i) { 
    return color(d.data.candidate);
  })
  .each(function(d) { this._current = d; });

path.on("mouseover", function(d) {
  var total = d3.sum(dataset.map(function(d) {
    return (d.enabled) ? d.dollars : 0;
  }));
  var percent = Math.round(1000 * d.data.dollars / total) / 10;
  tooltip.select(".candidate").html(d.data.candidate);
  tooltip.select(".dollars").html("$" + d.data.dollars + " million");
  tooltip.select(".percent").html(percent + "%");
  tooltip.style("display", "block")
});

path.on("mouseout", function() {
  tooltip.style("display", "none");
});

var legendRectSize = 18;
var legendSpacing = 4;

var legend = svg.selectAll(".legend")
  .data(color.domain())
  .enter()
  .append("g")
  .attr("class", "legend")
  .attr("font-size", "10px")
  .attr("transform", function(d, i) {
    var height = legendRectSize + legendSpacing;
    var offset =  height * color.domain().length / 2;
    var horz = -2 * legendRectSize;
    var vert = i * height - offset;
    return "translate(" + horz + "," + vert + ")";
  });

legend.append("rect")
        .attr("width", legendRectSize)
        .attr("height", legendRectSize)
        .style("fill", color)
        .style("stroke", color)
        .style("stroke-width", "2")
        .on("click", function(candidate) {
          var rect = d3.select(this);
          var enabled = true;
          var totalEnabled = d3.sum(dataset.map(function(d) {
            return (d.enabled) ? 1 : 0;
          }));

          if (rect.attr("class") === "disabled") {
            rect.attr("class", "");
          } else {
            if (totalEnabled < 2) return;
            rect.attr("class", "disabled");
            enabled = false;
          }

          pie.value(function(d) {
            if (d.candidate === candidate) d.enabled = enabled;
            return (d.enabled) ? d.dollars : 0;
          });

          path = path.data(pie(dataset));

          path.transition()
            .duration(750)
            .attrTween("d", function(d) {
              var interpolate = d3.interpolate(this._current, d);
              this._current = interpolate(0);
              return function(t) {
                return arc(interpolate(t));
              };
            });
        });

legend.append("text")
      .attr("x", legendRectSize + legendSpacing)
      .attr("y", legendRectSize - legendSpacing)
      .text(function(d) {return d;});

});



