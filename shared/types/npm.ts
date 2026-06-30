export interface NpmReplicateRegistryInfo {
    db_name: string
    engine: string
    doc_count: number
    update_seq: number
}

export interface NpmReplicateChangeRevision {
    rev: string
}

export interface NpmReplicateChangeResult {
    seq: number
    id: string
    changes: NpmReplicateChangeRevision[]
}

export interface NpmReplicateChangesResponse {
    results: NpmReplicateChangeResult[]
    last_seq: number
}

export interface NpmPackageStreamReadyEvent {
    since: number
    startedAt: string
}

export interface NpmPackageStreamItemEvent {
    seq: number
    name: string
    changes: NpmReplicateChangeRevision[]
    receivedAt: string
}

export interface NpmPackageStreamCheckpointEvent {
    lastSeq: number
    count: number
    receivedAt: string
}

export interface NpmPackageStreamHeartbeatEvent {
    since: number
    at: string
}

export interface NpmPackageStreamErrorEvent {
    message: string
    retryInMs: number
    at: string
}
