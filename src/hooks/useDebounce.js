import { useEffect, useState } from 'react'

// Возвращает value с задержкой: новое значение «проходит» только если
// за delay мс не появилось следующее. Нужен, чтобы не слать запрос на каждую букву.
export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timerId = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timerId) // новое значение сбрасывает таймер
  }, [value, delay])

  return debounced
}
