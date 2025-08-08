<script>
  import { scaleBand } from 'd3-scale'
  import { Axis, Bars, Chart, Layer } from 'layerchart'

  const { data, x, y, xLabel, yLabel } = $props()
</script>

<Chart
  {data}
  x={x}
  y={y}
  xScale={scaleBand().padding(0.4)}
  yDomain={[0, null]}
  padding={{ top: 20, bottom: 10, left: 20, right: 30 }}
>
  <Layer type='svg'>
    <Axis
      label={yLabel}
      labelPlacement='start'
      placement='left'
      grid={{ style: 'stroke-dasharray: 2' }}
      rule
    />
    <Axis
      label={xLabel}
      labelPlacement='end'
      placement='bottom'
      rule />
    <Bars
      strokeWidth={1}
      class='fill-primary'
    />
  </Layer>
</Chart>
