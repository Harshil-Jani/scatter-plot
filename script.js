import * as d3 from "https://cdn.skypack.dev/d3@7";
const width = window.innerWidth*0.95;
const height = window.innerHeight*0.95;
const svg = d3.select('svg')
    .attr('width', width)
    .attr('height', height);

let data;
let xColumn;
let yColumn;

const onXColumnClicked = column => {
    xColumn = column;
    render();
}
const onYColumnClicked = column => {
    yColumn = column;
    render();
}

const render = data => {
    const title = "g4run Analysis";
    const circleRadius = 10;

    const xValue = d => d.cycles;
    const xAxisLabel = 'Cycles';
    const yValue = d => d.instructions;
    const yAxisLabel = 'Instructions';

    const xScale = d3.scaleLinear()
        .domain(d3.extent(data,xValue))
        .range([0,width*0.8])
        .nice();

    const yScale = d3.scaleLinear()
        .domain(d3.extent(data,yValue))
        .range([height*0.8,0])
        .nice();

    const g = svg.append('g');

    const xAxis = d3.axisBottom(xScale)
        .tickSize(height*0.8)
        .tickPadding(5);
    const yAxis = d3.axisLeft(yScale)
        .tickSize(width*0.8)
        .tickPadding(5);

    const xAxisG = g.append('g').call(xAxis)
        .attr('transform',`translate(${width*0.08},${height*0.05})`);
    const yAxisG = g.append('g').call(yAxis)
        .attr('transform',`translate(${width*0.88},${height*0.05})`); 
    
    
    const tooltip = d3.select(".tool")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px")
        .style("position","absoulute")
        .attr("transform",`translate(0,-1000)`);

    g.selectAll('circle').data(data)
        .enter().append('circle')
            .attr('cx', d => xScale(xValue(d)))
            .attr('cy', d => yScale(yValue(d)))
            .attr('r',circleRadius)
            .attr('transform',`translate(${width*0.08},${height*0.035})`)
            .on("mouseover", (event,d) => {
                const [x,y] = d3.pointer(event);
                tooltip
                    .style("opacity", 1)
                    .style("margin-left",(x)+"px")
                    .style("margin-top",(y)+"px");

            })
            .on("mousemove", (event,d) => {
                tooltip
                    .html("The exact value of<br>the Ground Living area is:")
            })
            .on("mouseleave", (event,d) => {
                tooltip
                    .transition()
                    .duration(1000)
                    .style("opacity", 0)
            });

}

d3.csv('geant4.csv').then(data => {
    data.forEach(d => {
        d.dso = new String(d.dso);
        d.symbol = new String(d.symbol);
        d.cycles = +d.cycles;
        d.instructions = +d.instructions;
        d.branches = +d.branches;
        d.branch_misses = +d.branch_misses;
    });
    render(data);
});
