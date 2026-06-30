<template>
    <main class="relative flex h-dvh flex-col overflow-hidden overscroll-none bg-zinc-900 p-10">
        <SiteLine />

        <div
            :class="cn(
                'absolute inset-x-0 top-0',
                'z-10 flex h-11 shrink-0 items-center justify-center gap-7',
                'text-xs font-medium leading-none',
            )"
        >
            <span class="text-muted capitalize">pack run</span>
        </div>
        <div class="relative z-10 min-h-0 flex-1">
            <section
                :class="cn(
                    'relative',
                    'h-full overflow-hidden',
                    'bg-neutral-800',
                )"
            >
                <PackageStream />
            </section>

            <SiteDot />
        </div>

        <SiteFooter />
    </main>
</template>

<script lang="ts" setup>
import { cn } from '@/lib/utils'
</script>
