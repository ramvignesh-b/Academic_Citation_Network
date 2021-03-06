function plot_whole(){

  var width = 800,
    height = 750,
    padding = 1.5;

  var fill = function() {
    var d3_category = ["#3957ff", "#d3fe14", "#c9080a", "#fec7f8", "#0b7b3e", 
    "#0bf0e9", "#c203c8", "#fd9b39", "#888593", "#906407", 
    "#98ba7f", "#fe6794", "#10b0ff", "#ac7bff", "#fee7c0", 
    "#964c63", "#1da49c", "#0ad811", "#bbd9fd", "#fe6cfe", 
    "#297192", "#d1a09c", "#78579e", "#81ffad", "#739400", 
    "#ca6949", "#d9bf01", "#646a58", "#d5097e", "#bb73a9", 
    "#ccf6e9", "#9cb4b6", "#b6a7d4", "#9e8c62", "#6e83c8", 
    "#01af64", "#a71afd", "#cfe589", "#d4ccd1", "#fd4109", 
    "#bf8f0e", "#2f786e", "#4ed1a5", "#d8bb7d", "#a54509", 
    "#6a9276", "#a4777a", "#fc12c9", "#606f15", "#3cc4d9", 
    "#f31c4e", "#73616f", "#f097c6", "#fc8772", "#92a6fe", 
    "#875b44", "#699ab3", "#94bc19", "#7d5bf0", "#d24dfe", 
    "#c85b74", "#68ff57", "#b62347", "#994b91", "#646b8c", 
    "#977ab4", "#d694fd", "#c4d5b5", "#fdc4bd", "#1cae05", 
    "#7bd972", "#e9700a", "#d08f5d", "#8bb9e1", "#fde945", 
    "#a29d98", "#1682fb", "#9ad9e0", "#d6cafe", "#8d8328", 
    "#b091a7", "#647579", "#1f8d11", "#e7eafd", "#b9660b", 
    "#a4a644", "#fec24c", "#b1168c", "#188cc1", "#7ab297", 
    "#4468ae", "#c949a6", "#d48295", "#eb6dc2", "#d5b0cb", 
    "#ff9ffb", "#fdb082", "#af4d44", "#a759c4", "#a9e03a", 
    "#0d906b", "#9ee3bd", "#5b8846", "#0d8995", "#f25c58", 
    "#70ae4f", "#847f74", "#9094bb", "#ffe2f1", "#a67149", 
    "#936c8e", "#d04907", "#c3b8a6", "#cef8c4", "#7a9293", 
    "#fda2ab", "#2ef6c5", "#807242", "#cb94cc", "#b6bdd0", 
    "#b5c75d", "#fde189", "#b7ff80", "#fa2d8e", "#839a5f", 
    "#28c2b5", "#e5e9e1", "#bc79d8", "#7ed8fe", "#9f20c3", 
    "#4f7a5b", "#f511fd", "#09c959", "#bcd0ce", "#8685fd", 
    "#98fcff", "#afbff9", "#6d69b4", "#5f99fd", "#aaa87e",
    "#b59dfb", "#5d809d", "#d9a742", "#ac5c86", "#9468d5", 
    "#a4a2b2", "#b1376e", "#d43f3d", "#05a9d1", "#c38375", 
    "#24b58e", "#6eabaf", "#66bf7f", "#92cbbb", "#ddb1ee", 
    "#1be895", "#c7ecf9", "#a6baa6", "#8045cd", "#5f70f1", 
    "#a9d796", "#ce62cb", "#0e954d", "#a97d2f", "#fcb8d3", 
    "#9bfee3", "#4e8d84", "#fc6d3f", "#7b9fd4", "#8c6165", 
    "#72805e", "#d53762", "#f00a1b", "#de5c97", "#8ea28b", 
    "#fccd95", "#ba9c57", "#b79a82", "#7c5a82", "#7d7ca4", 
    "#958ad6", "#cd8126", "#bdb0b7", "#10e0f8", "#dccc69", 
    "#d6de0f", "#616d3d", "#985a25", "#30c7fd", "#0aeb65", 
    "#e3cdb4", "#bd1bee", "#ad665d", "#d77070", "#8ea5b8", 
    "#5b5ad0", "#76655e", "#598100", "#86757e", "#5ea068", 
    "#a590b8", "#c1a707", "#85c0cd", "#e2cde9", "#dcd79c"
    ];
    return d3.scale.ordinal().range(d3_category);
  }();
  

  var force = d3.layout.force()
      .gravity(.08)
      .charge(-10)
      .linkDistance(200)
      .size([width, height]);

  d3.select("#visual").selectAll("*").remove();
  var svg = d3.select("#visual").append("svg")
      .attr("width", width)
      .attr("height", height);

  d3.json("cluster_network.json", function(error, graph) {
    if (error) throw error;

    var link = svg.selectAll("line")
        .data(graph.links)
      .enter().append("line")
      .attr("stroke-width", function(d){return d.value/100;});


    var node = svg.selectAll("circle")
        .data(graph.nodes)
      .enter().append("circle")
        .attr("r", function(d){ return d.size/80;})
        .style("fill", function(d) { return fill(d.group); })
        .style("stroke", function(d) { return d3.rgb(fill(d.group)).darker(); })
        .call(force.drag);

    force
        .nodes(graph.nodes)
        .links(graph.links)
        .on("tick", tick)
        .start();

    function tick(e) {
      node
          .each(collide(.5))
          .attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });

      link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });
    }

    // Resolves collisions between d and all other circles.
    function collide(alpha) {
      var quadtree = d3.geom.quadtree(graph.nodes);
      return function(d) {
        var r = d.size/80 + 50 + Math.max(padding),
            nx1 = d.x - r,
            nx2 = d.x + r,
            ny1 = d.y - r,
            ny2 = d.y + r;
        quadtree.visit(function(quad, x1, y1, x2, y2) {
          if (quad.point && (quad.point !== d)) {
            var x = d.x - quad.point.x,
                y = d.y - quad.point.y,
                l = Math.sqrt(x * x + y * y),
                r = d.size/80 + quad.point.size/80 + padding;
            if (l < r) {
              l = (l - r) / l * alpha;
              d.x -= x *= l;
              d.y -= y *= l;
              quad.point.x += x;
              quad.point.y += y;
            }
          }
          return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
        });
      };
    }

  });
}
