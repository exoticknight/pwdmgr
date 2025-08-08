<script>
  import { scaleBand } from 'd3-scale'
  import { Axis, Chart, Highlight, Layer, Points, Rule, Tooltip } from 'layerchart'

  const { data, x, y, xLabel, yLabel } = $props()
</script>

<Chart
  {data}
  x={x}
  y={y}
  xScale={scaleBand().padding(0.4)}
  yDomain={[0, null]}
  yNice
  padding={{ top: 20, bottom: 10, left: 20, right: 30 }}
  tooltip={{ mode: 'band' }}
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
    <Rule />
    <Points />
    <Highlight area />
    <Tooltip.Root>
      {#snippet children({ data })}
        <Tooltip.Header value={data[x]} />
        <Tooltip.List>
          <Tooltip.Item
            label={xLabel}
            value={data[y]}
          />
        </Tooltip.List>
      {/snippet}
    </Tooltip.Root>
  </Layer>
</Chart>
