<template>
    <div ref="streamViewport" class="h-full overflow-y-auto overscroll-none">
        <ul
            class="min-h-full space-y-2 px-4 py-4 sm:px-5 sm:py-5"
            aria-label="实时 npm 包发布列表"
        >
            <PackageStreamRow
                v-for="packageItem in packages"
                :key="packageItem.id"
                :name="packageItem.name"
                :published-at="packageItem.publishedAt"
            />
        </ul>
    </div>
</template>

<script setup lang="ts">
import { nextTick, useTemplateRef, watch } from 'vue'

defineOptions({
    name: 'PackageStream',
})

const { packages } = usePackageStream()
const streamViewport = useTemplateRef<HTMLElement>('streamViewport')

watch(
    () => packages.value.length,
    async () => {
        await nextTick()

        const viewport = streamViewport.value

        if (viewport === null) {
            return
        }

        viewport.scrollTop = viewport.scrollHeight
    },
)
</script>
