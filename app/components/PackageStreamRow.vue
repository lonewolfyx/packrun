<template>
    <li
        :class="cn(
            'flex animate-in items-center justify-start gap-4',
            'overflow-hidden',
            'duration-500 fade-in-0 slide-in-from-bottom-2',
        )"
    >
        <span class="shrink-0 whitespace-nowrap text-xs font-medium tabular-nums text-gray-300">[{{ publishedAtLabel }}]</span>
        <span class="text-gray-300">&gt;</span>
        <span class="text-gray-300 uppercase">publish</span>
        <NuxtLink
            :class="cn(
                'min-w-0 truncate text-sm font-semibold text-gray-300',
            )"
            :to="`https://npmjs.com/package/${props.name}`"
            target="_blank"
        >
            {{ props.name }}
        </NuxtLink>
    </li>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { cn } from '~/lib/utils'

defineOptions({
    name: 'PackageStreamRow',
})

const props = defineProps<{
    name: string
    publishedAt: string
}>()

const publishedAtLabel = computed(() => formatDateTime(props.publishedAt))

function formatDateTime(value: string) {
    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
        return value
    }

    const pad = (part: number) => String(part).padStart(2, '0')

    return [
        `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
        `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`,
    ].join(' ')
}
</script>
