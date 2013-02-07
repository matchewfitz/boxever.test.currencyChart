//invoke jQuery
$(function(){
	ecbNamespace.getLatestData();
});

var ecbNamespace = {
	//request data from the server
	'getLatestData':function(){	
		self = this;
	    myJsRoutes.controllers.Application.getData().ajax({
	    	'success':this.success,
	    	'error':this.error
	    });
	},
	
	//if the data is returned successfully
	'success':function(data){
		//report a success message
		$('#statusPane').hide().text('The data was successfully requested').fadeIn(1000);
		//parse the data into something usable
		self.rawData = $(data);
		self.extractData();
		//draw the chart
		self.drawChart();
	},
	
	//if there's a problem performing ajax
	'error':function(request, error){
		//report the error on screen
		$('#statusPane').hide().text('Error requesting data from backend').css({"color":"red"}).fadeIn(1000);
		//log the arguments to the console
		console.log(arguments);
	},
	
	//parse the xml structure and extract all relevant data.
	'extractData':function(){
		self = this;
		
		//strip the outer nodes from the raw data.
		var innerData = self.rawData[0].childNodes[0].childNodes[2].childNodes;
		
		//create a new list to store the extracted data.
		self.cleanData = [];
		for(i=0; i<innerData.length; i++){
		    if(innerData[i].childNodes.length > 0){
		    	//create a temporary object to store the extracted data
		    	dataPoint = {};
		    	
		    	//add time, currency and value variables and populate them from the raw data.
		    	dataPoint.time = innerData[i].attributes[0].value;
		    	dataPoint.currency = innerData[i].childNodes[0].attributes[0].value;
		    	dataPoint.value = innerData[i].childNodes[0].attributes[1].value;
		    	
		    	//add the datapoint to the cleanData list.
		    	self.cleanData.push(dataPoint);
		    }
		}	
	},
	
	//draw a chart on the page	
	'drawChart':function(){		
		var margin = {top: 20, right: 20, bottom: 30, left: 50},
	    width = 960 - margin.left - margin.right,
	    height = 500 - margin.top - margin.bottom;

		var parseDate = d3.time.format("%Y-%m-%d").parse;
	
		var x = d3.time.scale().range([0, width]);	
		var y = d3.scale.linear().range([height, 0]);	
		var xAxis = d3.svg.axis().scale(x).orient("bottom");	
		var yAxis = d3.svg.axis().scale(y).orient("left");
	
		var line = d3.svg.line()
			.x(function(d) {return x(d.time);})
		    .y(function(d) {return y(d.value);});
	
		var svg = d3.select("#euroChartContainer").append("svg")
		    .attr("width", width + margin.left + margin.right)
		    .attr("height", height + margin.top + margin.bottom)
		    .append("g")
		    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
		  self.cleanData.forEach(function(d) {
		    d.time = parseDate(d.time);
		    d.value = +d.value;
		  });
	
		  x.domain(d3.extent(self.cleanData, function(d) { 
			  return d.time;   
		  }));
		  y.domain(d3.extent(self.cleanData, function(d) { 
			  return d.value; 
		  }));
	
		  svg.append("g")
		      .attr("class", "x axis")
		      .attr("transform", "translate(0," + height + ")")
		      .call(xAxis);
	
		  svg.append("g")
		      .attr("class", "y axis")
		      .call(yAxis)
		    .append("text")
		      .attr("transform", "rotate(-90)")
		      .attr("y", 6)
		      .attr("dy", ".71em")
		      .style("text-anchor", "end")
		      .text("Price represented in USD");
	
		  svg.append("path")
		      .datum(self.cleanData)
		      .attr("class", "line")
		      .attr("d", line);
	}
};