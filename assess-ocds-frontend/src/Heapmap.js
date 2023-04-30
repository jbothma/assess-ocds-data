import { useD3 } from './hooks/useD3';
import React from 'react';
import * as d3 from 'd3';

function Heatmap({ data, rowKey, colKey, valKey }) {
  const squareSize = 40;
  const margin = { top: 30, right: 30, bottom: 30, left: 200 };
  const tickMargin = 10;

  const ref = useD3(
    (container) => {
      // Labels of row and columns
      const cols = [...new Set(data.map((d) => d[colKey]))];
      const rows = [...new Set(data.map((d) => d[rowKey]))];
      cols.sort();
      rows.sort();

      const plotWidth = cols.length * squareSize;
      const plotHeight = rows.length * squareSize;

      const width = plotWidth + margin.left + margin.right,
        height = plotHeight + margin.top + margin.bottom;


      const svg = container.select("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

      const plotArea = svg.select(".plot-area")
        .attr("transform", `translate(0, ${margin.top})`);

      // Build X scales and axis:
      const x = d3.scaleBand()
        .range([0, plotWidth])
        .domain(cols)
        .padding(0.05);
      svg.select(".x-axis")
        .attr("transform", `translate(0, ${plotHeight + margin.top})`)
        .call(d3.axisBottom(x))

      // Build y scales
      const y = d3.scaleBand()
        .range([plotHeight, 0])
        .domain(rows.reverse())
        .padding(0.05);

      // Build y axis
      const yAxis = container
        .selectAll(".y-axis")
        .data(["y-axis"])
        .join("div")
        .attr("class", "y-axis")
        .style("height", `${plotHeight}px`)
        .style("width", `${margin.left}px`)
        .style("top", `${margin.top}px`);
      const labels = yAxis.selectAll(".labelContainer")
        .data(rows)
        .join("div")
        .attr("class", "labelContainer")
        .style("top", (d) => `${y(d)}px`)
        .style("width", `${margin.left - tickMargin}px`)
        .style("height", `${squareSize}px`)
        .text((d) => d);

      yAxis.selectAll(".y-tick")
        .data(rows)
        .join("div")
        .attr("class", "y-tick")
        .style("top", (d) => `${y(d) + squareSize / 2}px`);

      const values = data.map((d) => d[valKey]);
      const max = d3.max(values);

      // Build color scale
      const myColor = d3.scaleLinear()
        .range(["#eee", "#000"])
        .domain([0, max]);

      // create a tooltip
      var tooltip = container.select(".tooltip")


      // Three function that change the tooltip when user hover / move / leave a cell
      var mouseover = function (e, d) {
        tooltip.style("display", "block")
      };
      var mousemove = function (e, d) {
        tooltip
          .html(`${d[rowKey]}<br>${d[colKey]}<br><b>${d[valKey]}`)
          .style("left", (x(d[colKey]) + margin.left + 0.5 * squareSize) + "px")
          .style("top", (y(d[rowKey]) - squareSize - 10) + "px");
      };
      var mouseleave = function (e, d) {
        tooltip.style("display", "none")
      }

      plotArea.selectAll()
        .data(data, function (d) { return d[colKey] + ':' + d[rowKey]; })
        .join("rect")
        .attr("x", function (d) { return x(d[colKey]) })
        .attr("y", function (d) { return y(d[rowKey]) })
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .style("fill", function (d) { return myColor(d[valKey]) })
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
        .exit().remove();
    },
    []
  );

  return (
    <div ref={ref} className="container">
      <svg
        style={{
          left: `${margin.left}px`
        }}
      >
        <g className="plot-area" />
        <g className="x-axis" />
      </svg>
      <div className="tooltip"></div>
    </div >
  );
}

export default Heatmap;