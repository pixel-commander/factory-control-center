import { useState, useEffect, useCallback } from 'react'

type SubProps = () => void

const SUBS = new Set<SubProps>()
let STREAM: EventSource | null = null

const openStream = (): void => {
  if (STREAM || typeof window === 'undefined' || typeof EventSource === 'undefined') return
  try {
    STREAM = new EventSource('/api/events')
    STREAM.addEventListener('changed', () => {
      SUBS.forEach(fn => { try { fn() } catch { /* one sub never stops the rest */ } })
    })
  } catch {
    STREAM = null
  }
}

const subscribe = (fn: SubProps): (() => void) => {
  openStream()
  SUBS.add(fn)
  return () => { SUBS.delete(fn) }
}

export interface ApiSettingsProps {
  push?: boolean,
  [key: string]: unknown
}

export interface ApiStatusProps {
  loading: boolean,
  error: boolean,
  loaded: boolean,
  empty: boolean
}

export type ApiHandlerType = 'get' | 'add-new' | 'edit' | 'set' | 'delete'

export const useApi = <T = unknown,>(path: string, settings: ApiSettingsProps = {}) => {

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<boolean>(false)
  const [loaded, setLoaded] = useState<boolean>(false)

  const load = useCallback(() => {
    if (!path) return
    setLoading(true)
    setError(false)
    fetch(path)
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: T) => { setData(d); setLoading(false); setLoaded(true) })
      .catch(() => { setLoading(false); setError(true) })
  }, [path])

  useEffect(() => { load() }, [load])

  const push = settings?.push !== false
  useEffect(() => {
    if (!push || !path) return
    return subscribe(load)
  }, [push, path, load])

  const handleApi = useCallback((type: ApiHandlerType, options: Record<string, unknown> = {}) => {
    const base = path.split('?')[0]
    const { id, ...fields } = options || {}

    const row = (method: string, url: string, body: Record<string, unknown>) => {
      setLoading(true)
      setError(false)
      return fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
        .then(r => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
        .then(made => { load(); return made as Record<string, unknown> })
        .catch(() => { setLoading(false); setError(true); return null })
    }

    switch (type) {
      case 'get':
        load()
        return Promise.resolve(null)
      case 'add-new':
        return row('POST', base, options)
      case 'edit':
      case 'set':
        return row('PUT', `${base}/${String(id || '')}`, fields)
      case 'delete':
        return row('DELETE', `${base}/${String(id || '')}`, {})
      default:
        console.error(
          `invalid handler for useApi: '${type}'. The five verbs are ` +
          `get, add-new, edit, set, delete. Nothing was sent.`
        )
        return Promise.resolve(null)
    }
  }, [load, path])

  const empty = loaded && (Array.isArray(data) ? data.length === 0 : data === null || data === undefined)

  const status: ApiStatusProps = { loading, error, loaded, empty }

  return [data, handleApi, status] as const
}

export default useApi
