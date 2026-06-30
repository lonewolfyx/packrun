<template>
    <span
        :class="cn(
            'pointer-events-none absolute z-0 bg-neutral-800/35',
            'inset-y-0 left-10 w-px',
        )"
    />
    <span
        :class="cn(
            'pointer-events-none absolute z-0 bg-neutral-800/35',
            'inset-y-0 right-10 w-px',
        )"
    />
    <span
        :class="cn(
            'pointer-events-none absolute z-0 bg-neutral-800/35',
            'inset-x-0 top-10 h-px',
        )"
    />
    <span
        :class="cn(
            'pointer-events-none absolute z-0 bg-neutral-800/35',
            'inset-x-0 bottom-10 h-px',
        )"
    />
</template>

<script setup lang="ts">
import { cn } from '~/lib/utils'

defineOptions({
    name: 'SiteLine',
})
</script>
