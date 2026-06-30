import type {
    NpmPackageStreamCheckpointEvent,
    NpmPackageStreamErrorEvent,
    NpmPackageStreamHeartbeatEvent,
    NpmPackageStreamItemEvent,
    NpmPackageStreamReadyEvent,
    NpmReplicateChangesResponse,
    NpmReplicateRegistryInfo,
} from '#shared/types/npm'
import { createEventStream, defineEventHandler } from 'h3'

const NPM_REPLICATE_URL = 'https://replicate.npmjs.com/'
const CHANGES_LIMIT = 100
const POLL_INTERVAL_MS = 3000
const PACKAGE_PUSH_INTERVAL_MS = 160

type NpmEventStream = ReturnType<typeof createEventStream>

export default defineEventHandler((event) => {
    const eventStream = createEventStream(event)
    const abortController = new AbortController()

    eventStream.onClosed(() => {
        abortController.abort()
    })

    startPackageStream(eventStream, abortController.signal)
        .catch(error => handleStreamError(eventStream, abortController.signal, error))

    return eventStream.send()
})

async function startPackageStream(
    eventStream: NpmEventStream,
    signal: AbortSignal,
) {
    const { update_seq } = await fetchJson<NpmReplicateRegistryInfo>(NPM_REPLICATE_URL, signal)
    await pushSseEvent<NpmPackageStreamReadyEvent>(
        eventStream,
        'ready',
        {
            since: update_seq,
            startedAt: new Date().toISOString(),
        },
        update_seq,
    )

    await pollPackageChanges(eventStream, signal, update_seq)
}

async function pollPackageChanges(
    eventStream: NpmEventStream,
    signal: AbortSignal,
    initialSince: number,
) {
    let since = initialSince

    while (!signal.aborted) {
        const changes = await fetchChanges(since, signal)

        since = changes.last_seq
        if (changes.results.length > 0) {
            let pushedCount = 0

            for (const change of changes.results) {
                if (signal.aborted) {
                    break
                }

                await pushSseEvent<NpmPackageStreamItemEvent>(
                    eventStream,
                    'package',
                    {
                        seq: change.seq,
                        name: change.id,
                        changes: change.changes,
                        receivedAt: new Date().toISOString(),
                    },
                    change.seq,
                )

                pushedCount += 1

                if (pushedCount < changes.results.length) {
                    await sleep(PACKAGE_PUSH_INTERVAL_MS, signal)
                }
            }

            if (signal.aborted) {
                break
            }

            await pushSseEvent<NpmPackageStreamCheckpointEvent>(
                eventStream,
                'checkpoint',
                {
                    lastSeq: since,
                    count: pushedCount,
                    receivedAt: new Date().toISOString(),
                },
                since,
            )
        }
        else {
            await pushSseEvent<NpmPackageStreamHeartbeatEvent>(
                eventStream,
                'heartbeat',
                {
                    since,
                    at: new Date().toISOString(),
                },
            )
        }

        await sleep(POLL_INTERVAL_MS, signal)
    }

    await eventStream.close()
}

async function handleStreamError(
    eventStream: NpmEventStream,
    signal: AbortSignal,
    error: unknown,
) {
    if (signal.aborted) {
        return
    }

    await pushSseEvent<NpmPackageStreamErrorEvent>(
        eventStream,
        'error',
        {
            message: error instanceof Error ? error.message : 'Unknown stream error',
            retryInMs: POLL_INTERVAL_MS,
            at: new Date().toISOString(),
        },
    )
    await eventStream.close()
}

async function fetchChanges(since: number, signal: AbortSignal) {
    const url = new URL('/registry/_changes', NPM_REPLICATE_URL)
    url.searchParams.set('since', String(since))
    url.searchParams.set('limit', String(CHANGES_LIMIT))

    return await fetchJson<NpmReplicateChangesResponse>(url.toString(), signal)
}

async function fetchJson<T>(url: string, signal: AbortSignal): Promise<T> {
    const response = await fetch(url, {
        signal,
        headers: {
            accept: 'application/json',
        },
    })

    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
    }

    return await response.json() as T
}

async function pushSseEvent<T>(
    eventStream: NpmEventStream,
    event: string,
    data: T,
    id?: number,
    retry?: number,
) {
    await eventStream.push({
        ...(id !== undefined ? { id: String(id) } : {}),
        ...(retry !== undefined ? { retry } : {}),
        event,
        data: JSON.stringify(data),
    })
}

function sleep(ms: number, signal: AbortSignal) {
    return new Promise<void>((resolve) => {
        if (signal.aborted) {
            resolve()
            return
        }

        const timer = setTimeout(resolve, ms)

        signal.addEventListener('abort', () => {
            clearTimeout(timer)
            resolve()
        }, { once: true })
    })
}
