import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [stored, setStored] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (!item) return initialValue
      const saved = JSON.parse(item) as T
      // Merge so new fields added to the default are always present in old saves
      if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
        return { ...initialValue, ...saved } as T
      }
      return saved
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(stored))
    } catch {
      // storage full or unavailable
    }
  }, [key, stored])

  return [stored, setStored]
}
