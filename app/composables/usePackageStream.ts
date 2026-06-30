import type { NpmPackageStreamItemEvent } from '#shared/types/npm'
import { onMounted, onUnmounted, readonly, ref } from 'vue'

export interface PackageStreamItem {
    id: string
    name: string
    publishedAt: string
    seq?: number
}

interface PackageStreamPayload extends NpmPackageStreamItemEvent {
    publishedAt?: string
    time?: string
}

export function usePackageStream() {
    const maxItems = 100
    const packages = ref<PackageStreamItem[]>([])

    let eventSource: EventSource | null = null
    let localId = 0

    function openStream() {
        if (eventSource !== null || !import.meta.client) {
            return
        }

        eventSource = new EventSource('/api/npm/packages/stream')
        eventSource.addEventListener('package', handlePackageEvent)
    }

    function closeStream() {
        eventSource?.removeEventListener('package', handlePackageEvent)
        eventSource?.close()
        eventSource = null
    }

    function handlePackageEvent(event: Event) {
        const packageItem = parsePackageEvent(event as MessageEvent<string>)

        if (packageItem === null) {
            return
        }

        packages.value = [
            ...packages.value,
            packageItem,
        ].slice(-maxItems)
    }

    function parsePackageEvent(event: MessageEvent<string>): PackageStreamItem | null {
        try {
            const payload = JSON.parse(event.data) as Partial<PackageStreamPayload>
            const name = normalizePackageName(payload.name)

            if (name === null) {
                return null
            }

            localId += 1
            const eventId = payload.seq ?? event.lastEventId ?? 'package'

            return {
                id: `${eventId}-${localId}`,
                name,
                publishedAt: normalizePublishedAt(payload),
                ...(typeof payload.seq === 'number' ? { seq: payload.seq } : {}),
            }
        }
        catch {
            return null
        }
    }

    function normalizePackageName(name: unknown) {
        if (typeof name !== 'string') {
            return null
        }

        const trimmedName = name.trim()

        return trimmedName.length > 0 ? trimmedName : null
    }

    function normalizePublishedAt(payload: Partial<PackageStreamPayload>) {
        const value = payload.publishedAt ?? payload.time ?? payload.receivedAt

        return typeof value === 'string' && value.length > 0
            ? value
            : new Date().toISOString()
    }

    onMounted(openStream)
    onUnmounted(closeStream)

    return {
        packages: readonly(packages),
    }
}
