<script setup lang="ts">
  import type { CSSProperties, PropType } from 'vue'
  import data from './iconfont-data'
  import type { IconfontType } from './iconfont-types'
  
  const props = defineProps({
    size: {
      type: Number,
    },
    color: {
      type: String,
      default: '#000000',
    },
    name: {
      type: String as PropType<IconfontType>,
      required: true,
    },
  })
  
  const mask = computed(() => {
    return `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(data[props.name])}")`
  })
  
  const innerStyle = computed(() => {
    return {
      'mask': mask.value,
      '-webkit-mask': mask.value,
      'backgroundColor': props.color,
      'width': props.size ? `${props.size}px` : '1em',
      'height': props.size ? `${props.size}px` : '1em',
      'display': 'inline-block',
      'backgroundRepeat': 'no-repeat',
    } satisfies CSSProperties
  })
  </script>
  
  <template>
    <div :style="innerStyle" />
  </template>
  