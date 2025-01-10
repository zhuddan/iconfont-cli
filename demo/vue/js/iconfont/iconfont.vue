<script setup>
import data from './iconfont-data'
/**
 * @typedef {"loading" | "check-order" | "trade" | "connect" | "setup" | "coupon" | "order" | "notice" | "remark" | "navigate" | "user" | "phone" | "clock" | "chat" | "store" | "star" | "star-fill" | "close" | "shop" | "location" | "down" | "left" | "plus" | "right" | "search" | "up"} IconfontTypes
 */
const props = defineProps({
  size: {
    type: Number,
  },
  color: {
    type: String,
    default: '#000000',
  },
  /**
   * @type {import('vue').PropType<IconfontTypes>}
   */
  name: {
    type: String,
    required: true,
  },
})

const mask = computed(() => {
  return `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(data[props.name])}") no-repeat`
})

const innerStyle = computed(() => {
  const _size = props.size ? `${props.size}px` : '1em'
  return {
    'mask': mask.value,
    '-webkit-mask': mask.value,
    'mask-size': _size,
    'width': _size,
    'height': _size,
    'backgroundColor': props.color,
  }
})
</script>

<template>
  <div class="iconfont" :style="innerStyle" />
</template>

<style>
.iconfont {
  display: inline-block;
  mask-repeat: no-repeat;
}
</style>
