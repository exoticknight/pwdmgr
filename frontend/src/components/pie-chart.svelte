<script lang='ts'>
  import { PieChart } from 'layerchart'

  const { data, key, value } = $props()
</script>

<PieChart {data} key={key} value={value} legend />
