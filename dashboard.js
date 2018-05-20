var diameter = 630;
var color    = d3.scale.category10();
var firstTime = true;
var firstTime_bar = true;
var bubble = d3.layout.pack()
    .sort(null)
    .size([600, diameter])
    .padding(10);

var svg = d3.select("#bubble-chart")
    .append("svg")
    .attr("width", 600)
    .attr("height", diameter);

var width = 530;
var height = 270;
var parseDate = d3.time.format("%b").parse;

var x = d3.time.scale().range([0, width - 30]);
var y = d3.scale.linear().range([height, 40]);

var xAxis = d3.svg.axis().scale(x)
            .orient("bottom").ticks(d3.time.months, 1).tickFormat(d3.time.format("%b"));
     
var yAxis = d3.svg.axis().scale(y)
            .orient("left").ticks(10);

var x_bar = d3.scale.ordinal()
    .rangeRoundBands([0, width - 30], .1);

var y_bar = d3.scale.linear().range([height, 40]);

var xAxis_bar = d3.svg.axis()
    .scale(x_bar)
    .orient("bottom");

var yAxis_bar = d3.svg.axis().scale(y_bar)
            .orient("left").ticks(10);

var svg_bar = d3.select("#bar_chart").append("svg")
    .attr("width", width + 40)
    .attr("height", height + 20)
  .append("g")
    .attr("transform", "translate(" + 50 + "," + (-10) + ")");

var svg_line = d3.select("#tag_trend-card")
    .append("svg")
        .attr("width", width + 40)
        .attr("height", height + 20)
    .append("g")
        .attr("transform", "translate(" + 50 + "," + (-10) + ")");

d3.csv("BubbleData.csv", function(error, data){

    data = data.map(function(d){ d.value = +d["Count"]; return d; });

    var nodes = bubble.nodes({children:data}).filter(function(d) { return !d.children; });

    var bubbles = svg.selectAll("circle")
        .attr("transform", "translate(0,0)")
        .data(nodes)
        .enter()
        .append("g");

    svg.append ("text")
        .attr("y", 30).attr("x",10)
        .text("Top 100 Tags")
        .attr("font-size", "30px")
        .attr("font-family", "Impact, fantasy")
        .style({"fill":"#898989"});

    bubbles.append("circle")
        .attr("r", function(d){ return d.r+2; })
        .attr("cx", function(d){ return d.x; })
        .attr("cy", function(d){ return d.y; })
        .style("fill", function(d) { return color(d.value); })
        .on("mouseover", handlemouseover)
        .on("mouseout", handlemouseout)
        .on('click', handlemouseclick);

    var label = bubbles.append("text")
        .attr("x", function(d){ return d.x; })
        .attr("y", function(d){ return d.y; })
        .attr("text-anchor", "middle")
        .text(function(d){ return d["Tag"]; })
        .style({
            "fill":"black", 
            "font-family":"Helvetica Neue, Helvetica, Arial, san-serif",
        })
        .attr("font-size", (d) => {return d.r/2.5})
        .text(function(d){ return d["Tag"]; })
	    .each(function(d, i) {
	      var nm = d.Tag,
        	lineNumber = 0,
        	lineHeight = 5;
	      var arr = nm.replace(/[\(\)\\/,-]/g, " ").replace(/\s+/g, " ").split(" "), arrlength = (arr.length > 3) ? 4 : arr.length;
	      d3.select(this).attr('y',"-" + (arrlength) + "em");
	      for(var n = 0; n < arrlength; n++) {
	        var tsp = d3.select(this).append('tspan').attr("x", (d) => {return d.x}).attr("y", (d) => {return d["Count"] > 5000 ? d.y : d.y - 15}).attr("dy", (d) => { return d["Count"] > 2000 ? ++lineNumber * (lineHeight + 7) : ++lineNumber * lineHeight + 10}).text(nm);
	          tsp.text(arr[n] + "");
	    }
	});


    function handlemouseover(e) {
    	d3.selectAll("circle").style({"fill":"#D5D6D6"});
    	d3.select(this).style("fill", (d) => { return color(d.value);})
    		.append("title").text((d)=>{return d["Tag"]+" was tagged "+d["Count"]+ " times"});
    }

    function handlemouseout() {
    	d3.selectAll("circle").style("fill", (d) => { return color(d.value);});  	
    }

    function handlemouseclick(d) {
        updateLineGraph(d);
        updateBarGraph(d);
    }

    function updateBarGraph(d){
        // TO FILL
        var bars;
        var tagname = d.Tag;
        var count = d.Count;

        if(tagname === "null-pointer-exception")
            var filename = "./TSV/nullpointerexception.tsv";
        else if(tagname === "c#")
            var filename = "./TSV/csharp.tsv";
        else
            var filename = "./TSV/"+tagname+".tsv"

        console.log(filename);


        var tip = d3.tip()
          .attr('class', 'd3-tip')
          .offset([-10, 0])
          .html(function(d) {
            return "<strong style='color:#7ff9f9; font-size:10px'>Question:</strong> <span style='color:white; font-size:10px'>" + d.Question + "</span>";
          })

          svg_bar.call(tip);

        d3.tsv(filename, type, function(error, data) {
            x_bar.domain(data.map(function(d) { return d.Number; }));
            y_bar.domain([0, d3.max(data, function(d) { return d.Votes; })]);

            if(!firstTime_bar) {
                var svg2_bar = d3.select("#bar_chart").transition();

                var bars2 = svg_bar.selectAll(".bar").data(data);

                bars2.enter()
                      .append("rect")
                        .attr("class", "bar")
                        .attr("x", function(d) { return x_bar(d.Number); })
                        .attr("width", x_bar.rangeBand())
                        .attr("y", function(d) { return y_bar(d.Votes); })
                        .attr("height", function(d) { return height - y_bar(d.Votes); })

                bars2.on("mouseover", tip.show)
                        .on("mouseout", tip.hide);

                bars2
                        .transition().duration(1050)
                        .attr("y", function(d) { return y_bar(d.Votes); })
                        .style({"fill": color(count)})
                        .attr("height", function(d) { return height - y_bar(d.Votes); });

                bars2.exit().remove();

                svg2_bar.select(".tagname")
                .text(tagname)
                .duration(100)
                .style({"fill": color(count)});

                svg2_bar.selectAll("g.y.axis")
                .duration(1200)
                .call(yAxis_bar);


            }
            else{
                svg_bar.append("g")
                  .attr("class", "x axis")
                  .attr("transform", "translate(0," + height + ")")
                .style({"font-size":"10px"})
                  .call(xAxis_bar);

              svg_bar.append("g")
                  .attr("class", "y axis")
                .style({"font-size":"10px"})
                  .call(yAxis_bar)

                  svg_bar.append ("text")
                    .attr("x", 320)
                    .attr("y", 65)
                    .text(tagname)
                    .attr("font-size", "20px")
                    .attr("class", "tagname")
                    .attr("font-family", "Impact, fantasy")
                    .style({"fill": color(count)});

                svg_bar.append ("text")
                    .attr("id", "Qtext")
                    .attr("x", 320)
                    .attr("y", 75)
                    .attr("font-size", "20px")
                    .attr("class", "tagname")
                    .attr("font-family", "Impact, fantasy")
                    .style({"fill": color(count)});

                svg_bar.append("text")
                    .attr("x", -45)
                    .attr("y", 30)
                    .text("Frequency of Question")
                    .attr("class", "y axis")
                    .attr("font-size", "12px")
                    .style({"fill":"#898989"});

                svg_bar.append ("text")
                    .attr("y", 298).attr("x",420)
                    .attr("class", "x axis")
                    .text("Top 10 Questions")
                    .attr("font-size", "12px")
                    .style({"fill":"#898989"});

              bars = svg_bar.selectAll(".bar")
                  .data(data)
                  .enter().append("rect")
                  .attr("class", "bar")
                  .attr("x", function(d) { return x_bar(d.Number); })
                  .attr("width", x_bar.rangeBand())
                  .attr("y", function(d) { return y_bar(d.Votes); })
                  .style({"fill": color(count)})
                  .attr("height", function(d) { return height - y_bar(d.Votes); })
                  .on("mouseover", tip.show)
                  .on("mouseout", tip.hide);

                firstTime_bar = false;
            }

        })

        function type(d) {
            d.Votes = +d.Votes;
            return d;
        }

        function handlemouseoverbar() {
            d3.select(this).style("fill", "black")
            .append("title").text((d)=>{ return d["Question"]});
        }

        function handlemouseoutbar() {
            d3.select(this).style("fill", (d) => {return color(count);})
        }
    }

    function updateLineGraph(d) {
        var count = d.Count;
        var tagname = d.Tag;
        
        if(tagname === "c#")
            var filename = "./TagCount/TagTrend_csharp.csv";
        else
            var filename = "./TagCount/TagTrend_"+tagname+".csv";
        console.log(filename);

        d3.csv(filename, function(error, data) {
        data.forEach(function(d) {
            d.Month = parseDate(d.Month);
            d.Count = +d.Count;
        });
     
        // Define the line
        var valueline = d3.svg.line()
            .interpolate("monotone") 
            .x(function(d) { return x(d.Month); })
            .y(function(d) { return y(d.Count); });

        // Scale the range of the data
        x.domain(d3.extent(data, function(d) { return d.Month; }));
        y.domain([d3.min(data, function(d) { return d.Count - 100; }), d3.max(data, function(d) { return d.Count+500; })]);

        if(!firstTime){
            var svg2 = d3.select("#tag_trend-card").transition();

            svg2.select(".line")
            .style({"stroke": color(count)})
            .duration(1050)
            .attr("d", valueline(data));

            svg2.select(".tagname")
            .text(tagname)
            .duration(1050)
            .style({"fill": color(count)});

            svg2.selectAll("g.y.axis")
            .duration(1200)
            .call(yAxis);

        }
        else{
            svg_line.append ("text")
            .attr("y", 300).attr("x",470)
            .attr("class", "x axis")
            .text("Month")
            .attr("font-size", "15px")
            .style({"fill":"#898989"});

            svg_line.append ("text")
            .attr("x", -45)
            .attr("y", 30)
            .text("Frequency of tag")
            .attr("class", "y axis")
            .attr("font-size", "15px")
            .style({"fill":"#898989"});

            svg_line.append ("text")
            .attr("x", 320)
            .attr("y", 85)
            .text(tagname)
            .attr("font-size", "20px")
            .attr("class", "tagname")
            .attr("font-family", "Impact, fantasy")
            .style({"fill": color(count)});
         
            // Add the valueline path.
            svg_line.append("path")  
                .attr("class", "line")
                .style({"stroke": color(count)})
                .attr("d", valueline(data));
         
            // Add the X Axis
            svg_line.append("g")     
                .attr("class", "x axis")
                .attr("transform", "translate(0,"+(height)+")")
                .style({"font-size":"10px"})
                .call(xAxis);
         
            // Add the Y Axis
            svg_line.append("g")     
                .attr("class", "y axis")
                .style({"font-size":"10px"})
                .call(yAxis);

            firstTime = false;
            }   
        });
    }
})