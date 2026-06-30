<template>
    <span :class="cn(handleClass, 'left-0 top-0 -translate-x-1/2 -translate-y-1/2')" aria-hidden="true" />
    <span :class="cn(handleClass, 'right-0 top-0 -translate-y-1/2 translate-x-1/2')" aria-hidden="true" />
    <span :class="cn(handleClass, 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2')" aria-hidden="true" />
    <span :class="cn(handleClass, 'bottom-0 right-0 translate-x-1/2 translate-y-1/2')" aria-hidden="true" />
</template>

<script setup lang="ts">
import { cn } from '~/lib/utils'

defineOptions({
    name: 'SiteDot',
})

const handleClass = cn(
    'pointer-events-none absolute z-30 size-2.5 bg-zinc-400 rounded',
    'shadow-[0_1px_2px_rgb(0_0_0_/_0.05)]',
)
</script>
