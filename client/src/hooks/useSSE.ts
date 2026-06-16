import { useRef, useCallback, useState } from 'react'
import type { SSEEvent } from '../types'

interface UseSSEReturn {
  isConnected: boolean
  error: string | null
  connect: (url: string, body: object) => void
  disconnect: () => void
  onEvent: (cb: (event: SSEEvent) => void) => void
}

export function useSSE(): UseSSEReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const callbackRef = useRef<((event: SSEEvent) => void) | null>(null)
  const retryCountRef = useRef(0)
  const MAX_RETRIES = 3

  const onEvent = useCallback((cb: (event: SSEEvent) => void) => {
    callbackRef.current = cb
  }, [])

  const connect = useCallback(async (url: string, body: object) => {
    setError(null)
    setIsConnected(true)
    retryCountRef.current = 0
    abortRef.current = new AbortController()

    const doConnect = async () => {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: abortRef.current?.signal
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const reader = response.body?.getReader()
        if (!reader) throw new Error('No response body')

        const decoder = new TextDecoder()
        let buffer = ''

        // 逐块读取 SSE 流
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })

          const lines = buffer.split('\n')
          buffer = ''

          let currentEvent = ''
          let currentData = ''

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              currentEvent = line.slice(7).trim()
            } else if (line.startsWith('data: ')) {
              currentData = line.slice(6)
            } else if (line === '' && currentData) {
              const parsed = JSON.parse(currentData) as SSEEvent
              callbackRef.current?.(parsed)
              currentEvent = ''
              currentData = ''
            }
          }

          if (lines.length && !lines[lines.length - 1].startsWith('event: ') && lines[lines.length - 1] !== '') {
            buffer = lines[lines.length - 1] // 缓存不完整行，等下一块数据
          }
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return
        if (retryCountRef.current < MAX_RETRIES) {
          retryCountRef.current++
          await new Promise((r) => setTimeout(r, 1000 * retryCountRef.current))
          await doConnect()
        } else {
          setError(err.message || '连接失败')
          callbackRef.current?.({ type: 'error', message: err.message || '连接失败' })
        }
      } finally {
        setIsConnected(false)
      }
    }

    doConnect()
  }, [])

  const disconnect = useCallback(() => {
    abortRef.current?.abort()
    setIsConnected(false)
  }, [])

  return { isConnected, error, connect, disconnect, onEvent }
}
