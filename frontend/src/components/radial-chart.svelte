<script lang='ts'>
  import { curveLinearClosed } from 'd3-shape'
  import { LineChart } from 'layerchart'

  const { data, x, y } = $props()
</script>

<LineChart
  data={data}
  x={x}
  y={y}
  yPadding={[0, 8]}
  padding={{ top: 8 }}
  radial
  points
  props={{
    spline: {
      curve: curveLinearClosed,
    },
    xAxis: {
      tickLength: 0,
    },
    yAxis: {
      ticks: 4,
      format: 'metric',
    },
    grid: {
      radialY: 'linear',
    },
    highlight: {
      lines: false,
    },
    tooltip: {
      context: {
        mode: 'voronoi',
      },
    },
  }}
/>
