function getData(d3, file, content) {

    var dataset = d3.csvParse(content, function(d) {
        return {
            number: +d.number,
            likelihood: d.likelihood.split(';'),
            severity: d.severity.split(';'),
            risk: d.risk,
            comment: d.comment,
            mitigation: d.mitigation
        }
    });

    handleData(d3, dataset);

}

//function getData(d3, path) {

//    d3.csv(path, function(error, dataset) {
//        dataset.forEach(function(d) {
//            d.number = +d.number;
//            d.likelihood = d.likelihood.split(';');
//            d.severity = d.severity.split(';');
//        });

//    handleData(d3, dataset);
//    });

//}

function handleData(d3, dataset) {

    // calculate criticality
    dataset.forEach(function(d) {
        d.criticality = (d3.mean(d.likelihood) * d3.mean(d.severity)).toFixed(1);
    });

    // create nice Table
    createTable(d3, dataset);
    createScatterplot(d3, dataset);
    createBarplot(d3, dataset);
    createSingleScatterplot(d3, dataset);

}

function ellsize(inarr) {
    diff = (d3.max(inarr)-d3.min(inarr)) / 2
    if (diff == 0) {
        diff = 0.1;
    }
    return diff;
}

function createTable(d3, dataset) {

    var risklist = d3.select('body').append('section');
    var rlh2 = risklist.append('h2')
            .text('Risks');

    var table = risklist.append('table')
        thead = table.append('thead'),
        tbody = table.append('tbody');

    cols = ['number','risk','likelihood','severity','criticality']

    thead.append('tr')
        .selectAll('th')
        .data(cols)
        .enter().append('th').text(function(col) {return col;})
        .attr('style', 'padding-left:1em')

    rows = tbody.selectAll('tr')
        .data(dataset)
        .enter().append('tr');

    cells = rows.selectAll('td')
        .data(function(row) {
            return cols.map(function(col) {
                return {col: col, value: row[col]};
            });
        })
        .enter().append('td')
                .attr('style', 'padding-left:1em')
            .text(function(d) { return d.value; });

}

function createScatterplot(d3, dataset) {

    var scatterplot = d3.select('body').append('section');
    var sph2 = scatterplot.append('h2')
            .text('Scatterplot');

    // Set the dimensions of the canvas / graph
    var margin = {top: 60, right: 60, bottom: 60, left: 60},
        width = 600 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    // Set the ranges
    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    var xAxis = d3.axisBottom(x),
        yAxis = d3.axisLeft(y);

    // append the svg obgect to the body of the page
    var svg = scatterplot.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)

    var focus = svg.append('g')
        .attr('class', 'focus')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Scale the range of the data
    x.domain([0,4]);
    y.domain([0,4]);

     // Add the scatterplot
     var dots = focus.append('g')
     dots.selectAll('dot')
        .data(dataset)
        .enter().append('ellipse')
        .style('fill', 'coral')
        .style('opacity', 0.5)
        .attr('rx', function(d) {return x(ellsize(d.likelihood));})
        .attr('ry', function(d) {return x(ellsize(d.severity));})
        .attr('cx', function(d) {return x(d3.mean(d.likelihood));})
        .attr('cy', function(d) {return y(d3.mean(d.severity));})

    focus.append('g')
          .attr('class', 'axis axis--x')
          .attr('transform', 'translate(0,' + height + ')')
          .call(xAxis);

    focus.append('g')
          .attr('class', 'axis axis--y')
          .call(yAxis);

    focus.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'translate('+width/2+','+(height+40)+ ')')
        .text('liklihood');

    focus.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'translate('+(-40)+','+height/2+ ')rotate(-90)')
        .text('severity');

}

function createBarplot(d3, dataset) {

    var barplot = d3.select('body').append('section');
    var bph2 = barplot.append('h2')
            .text('Barplot');

    var width = 900,
        barHeight = 20;

    var x = d3.scaleLinear()
        .domain([0, 9])
        .range([0, width*(2/3)]);

    var xAxis = d3.axisBottom(x);

    var chart = barplot.append('svg')
        .attr('width', width)
        .attr('height', barHeight * (dataset.length+2));

    var bar = chart.selectAll('g')
        .data(dataset)
    .enter().append('g')
        .attr('transform', function(d, i) { return 'translate(30,' + i * barHeight + ')'; });

    bar.append('rect')
        .attr('width', function(d) { return x(d.criticality); })
        .attr('height', barHeight - 1)
        .attr('fill', 'coral');

    bar.append('text')
        .attr('x', -3)
        .attr('y', barHeight / 2)
        .attr('dy', '.35em')
        .attr('fill', 'gray')
        .attr('font', '12px sans-serif')
        .attr('text-anchor', 'end')
        .text(function(d) { return '#'+d.number; });

    bar.append('text')
        .attr('x', function(d) { return x(d.criticality) - 3; })
        .attr('y', barHeight / 2)
        .attr('dy', '.35em')
        .attr('fill', 'white')
        .attr('font', '12px sans-serif')
        .attr('text-anchor', 'end')
        .text(function(d) { return d.criticality; });

    bar.append('text')
        .attr('x', function(d) { return x(d.criticality) + 3; })
        .attr('y', barHeight / 2)
        .attr('dy', '.35em')
        .attr('fill', 'black')
        .attr('font', '12px sans-serif')
        .attr('text-anchor', 'start')
        .text(function(d) { return d.risk; });

    chart.append('g')
          .attr('class', 'axis axis--x')
          .attr('transform', 'translate(30,' + barHeight * (dataset.length) + ')')
          .call(xAxis);

    chart.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'translate('+width*(2/3)/2+','+barHeight*(dataset.length+1.5)+ ')')
        .text('criticality');

}

function createSingleScatterplot(d3, dataset) {

    var singlescatterplot = d3.select('body').append('section');
    var ssph2 = singlescatterplot.append('h2')
            .text('Scatterplots for all risks');

    var risks = singlescatterplot.append('article')

    var risk = risks.selectAll('div')
        .data(dataset)
    .enter().append('div')

    // Set the dimensions of the canvas / graph
    var margin = {top: 60, right: 60, bottom: 60, left: 60},
        width = 600 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    // Set the ranges
    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    var xAxis = d3.axisBottom(x),
        yAxis = d3.axisLeft(y);

    // Scale the range of the data
    x.domain([0,4]);
    y.domain([0,4]);

    risk.append('h3')
        .text(function(d) { return d.risk; })

    var focus = risk.append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
                .attr('class', 'focus')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    risk.append('p')
        .text(function(d) { return 'comment: '+d.comment; })
    risk.append('p')
        .text(function(d) { return 'mitigation: '+d.mitigation; })

     // Add the scatterplot
     focus.append('g')
        .append('ellipse')
        .style('fill', 'coral')
        .style('opacity', 0.5)
        .attr('rx', function(d) {return x(ellsize(d.likelihood));})
        .attr('ry', function(d) {return x(ellsize(d.severity));})
        .attr('cx', function(d) {return x(d3.mean(d.likelihood));})
        .attr('cy', function(d) {return y(d3.mean(d.severity));})

    focus.append('g')
          .attr('class', 'axis axis--x')
          .attr('transform', 'translate(0,' + height + ')')
          .call(xAxis);

    focus.append('g')
          .attr('class', 'axis axis--y')
          .call(yAxis);

    focus.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'translate('+width/2+','+(height+40)+ ')')
        .text('liklihood');

    focus.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'translate('+(-40)+','+height/2+ ')rotate(-90)')
        .text('severity');

}

function genReport(file, content) {

    document.getElementById('body').innerHTML = '<header><h1>risky - risk report of '+file.name.split('.')[0]+'</h1></header>';
    getData(window.d3, file, content);

}

//function genReport(path) {

//    document.getElementById('body').innerHTML = '<header><h1>risky - risk report of '+path.split('/')[path.split('/').length-1].split('.')[0]+'</h1></header>';
//    getData(window.d3, path);

//}
