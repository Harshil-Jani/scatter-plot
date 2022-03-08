import * as d3 from "https://cdn.skypack.dev/d3@7";
const width = window.innerWidth*0.95;
const height = window.innerHeight*0.95;
const svg = d3.select('svg')
    .attr('width', width)
    .attr('height', height);

const ParameterMenu = (some_parameter, props) =>{
    const {
        options,
        onOptionClicked
    } = props;

    let select = some_parameter.selectAll('select').data([null]);
    select = select.enter().append('select').merge(select)
    .on('change', function(){
        onOptionClicked(this.value);
    });
    
    const option = select.selectAll('option').data(options);
    option.enter().append('option').merge(option)
    .attr('value',d=>d)
    .text(d => d);
}

const scatterPlot = (parameters, props) => {
    const{
        title ,
        xValue,
        xAxisLabel,
        yValue,
        yAxisLabel,
        circleRadius,
        width,
        height,
        data
    } = props;

    const xScale = d3.scaleLinear()
        .domain(d3.extent(data,xValue))
        .range([0,width*0.8])
        .nice();

    const yScale = d3.scaleLinear()
        .domain(d3.extent(data,yValue))
        .range([height*0.8,0])
        .nice();

    const g = parameters.selectAll('.container').data([null]);
    const gEnter = g.enter().append('g').attr('class','container');
    gEnter.merge(g);

    const xAxis = d3.axisBottom(xScale)
        .tickSize(height*0.8)
        .tickPadding(5);
    const yAxis = d3.axisLeft(yScale)
        .tickSize(width*0.8)
        .tickPadding(5);

    const yAxisG = g.select('.y-parameter');
    const yAxisGEnter = gEnter.append('g').attr('class','y-parameter')   
    yAxisG.merge(yAxisGEnter).call(yAxis)
    .attr('transform',`translate(${width*0.9},${height*0.05})`);

    const xAxisG = g.select('.x-parameter');
    const xAxisGEnter = gEnter.append('g').attr('class','x-parameter')   
    xAxisG.merge(xAxisGEnter).call(xAxis)
    .attr('transform',`translate(${width*0.1},${height*0.05})`);

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

    const circles = g.merge(gEnter).selectAll('circle').data(data);
    circles
        .enter().append('circle').merge(circles)
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

let data;
let xColumn;
let YColumn;
const onXColumnClicked = column => {
    xColumn = column;
    render();
 }
const onYColumnClicked = column => {
    YColumn = column;
    render();
}

const render = () => {

    d3.select('#x-parameter').call(  ParameterMenu, {
        options : data.columns,
        onOptionClicked: onXColumnClicked
    });

    d3.select('#y-parameter').call(  ParameterMenu, {
        options : data.columns,
        onOptionClicked: onYColumnClicked
    });

    svg.call(scatterPlot, {
        title: "Something",
        xValue: d => d[xColumn],
        xAxisLabel: 'X-AXIS-LABEL',
        yValue: d => d[YColumn],
        yAxisLabel: 'Y-AXIS-LABEL',
        circleRadius: 10,
        width,
        height,
        data
    });
}

d3.csv('geant4.csv').then(file_data => {
    data = file_data;
    data.forEach(d => {
        d.dso = new String(d.dso);
        d.symbol = new String(d.symbol);
        d.cycles = +d.cycles;
        d.instructions = +d.instructions;
        d.branches = +d.branches;
        d.branch_misses = +d.branch_misses;
    });
    xColumn = data.columns[0];
    YColumn = data.columns[0];
    render();
});
