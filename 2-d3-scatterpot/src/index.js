import './assets/index.scss';
import { margin, url } from './constant';
import * as d3 from "d3";

const width = 920 - margin.left - margin.right;
const height = 630 - margin.top - margin.bottom;

const x = d3.scaleLinear().range([0, width]);
const y = d3.scaleTime().range([0, height]);

const color = d3.scaleOrdinal(d3.schemeCategory10);

const timeFormat = d3.timeFormat('%M:%S');

const xAxis = d3.axisBottom(x).tickFormat(d3.format('d'));
const yAxis = d3.axisLeft(y).tickFormat(timeFormat);

const div = d3.select('body')
              .append('div')
              .attr('class', 'tooltip')
              .attr('id', 'tooltip')
              .style('opacity', 0);

const svg = d3.select('body')
              .append('svg')
              .attr('width', width + margin.left + margin.right)
              .attr('height', height + margin.top + margin.bottom)
              .attr('class', 'graph')
              .append('g')
              .attr('transform', `translate(${margin.left}, ${margin.top})`);

d3.json(url, function(error, data) {
  if(error) {
    throw error;
  }

  data.forEach((d) => {
      d.Place = +d.Place;
      const parsedTime = d.Time.split(':');
      d.Time = new Date(Date.UTC(1970, 0, 1, 0, parsedTime[0], parsedTime[1]));
  })

  x.domain([
    d3.min(data, (d) => d.Year - 1),
    d3.max(data, (d) => d.Year + 1),
  ])

  y.domain(d3.extent(data, (d) => d.Time));

  svg.append('g')
      .attr('class', 'x axis')
      .attr('id', 'x-axis')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis)
      .append('text')
      .attr('class', 'x-axis-label')
      .attr('x', width)
      .attr('y', -6)
      .style('text-anchor', 'end')
      .text('Year');
  
      svg.append('g')
    .attr('class', 'y axis')
    .attr('id', 'y-axis')
    .call(yAxis)
    .append('text')
    .attr('class', 'label')
    .attr('transform', 'rotate(-90)')
    .attr('y', 6)
    .attr('dy', '.71em')
    .style('text-anchor', 'end')
    .text('Best Time (minutes)');

  svg
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -160)
    .attr('y', -44)
    .style('font-size', 18)
    .text('Time in Minutes');

  svg
    .selectAll('.dot')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'dot')
    .attr('r', 6)
    .attr('cx', (d) => x(d.Year))
    .attr('cy', (d) => y(d.Time))
    .attr('data-xvalue', (d) => d.Year)
    .attr('data-yvalue', (d) => d.Time.toISOString())
    .style('fill', (d) =>  color(d.Doping !== ''))
    .on('mouseover', (d) => {
      div.style('opacity', 0.9);
      div.attr('data-year', d.Year);
      div.html(`${d.Name}: ${d.Nationality}<br />Year: ${d.Year}, Time: ${timeFormat(d.Time)}${(d.Doping ? '<br/><br/>' + d.Doping : '')}`)
        .style('left', d3.event.pageX + 'px')
        .style('top', d3.event.pageY - 28 + 'px')
    })
    .on('mouseout', () => div.style('opacity', 0));

  svg.append('text')
    .attr('id', 'title')
    .attr('x', width / 2)
    .attr('y', 0 - margin.top / 2)
    .attr('text-anchor', 'middle')
    .style('font-size', '30px')
    .text('Doping in Professional Bicycle Racing');

  // subtitle
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', 0 - margin.top / 2 + 25)
    .attr('text-anchor', 'middle')
    .style('font-size', '20px')
    .text("35 Fastest times up Alpe d'Huez");

  const legendContainer = svg.append('g').attr('id', 'legend');

  const legend = legendContainer
    .selectAll('#legend')
    .data(color.domain())
    .enter()
    .append('g')
    .attr('class', 'legend-label')
    .attr('transform', (d, i) => 'translate(0,' + (height / 2 - i * 20) + ')' );

  legend.append('rect')
    .attr('x', width - 18)
    .attr('width', 18)
    .attr('height', 18)
    .style('fill', color);

  legend.append('text')
    .attr('x', width - 24)
    .attr('y', 9)
    .attr('dy', '.35em')
    .style('text-anchor', 'end')
    .text((d) => d ?  'Riders with doping allegations' : 'No doping allegations')

})



