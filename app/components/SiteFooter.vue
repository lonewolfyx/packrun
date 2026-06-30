<template>
    <footer
        :class="cn(
            'absolute inset-x-0 bottom-0',
            'z-10 flex h-11 shrink-0 items-center justify-center gap-7',
            'text-xs font-medium leading-none',
        )"
    >
        <NuxtLink
            :class="cn(
                'transition text-gray-400',
            )"
            href="https://github.com/lonewolfyx/packrun"
            target="_blank"
        >
            Github
        </NuxtLink>
    </footer>
</template>

<script setup lang="ts">
import { cn } from '~/lib/utils'

defineOptions({
    name: 'SiteFooter',
})
</script>
