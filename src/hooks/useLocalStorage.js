import { useEffect, useState } from 'react'

/**
 * Пользовательский хук: состояние, синхронизированное с localStorage.
 *
 * Вся работа с localStorage вынесена сюда, чтобы в лабораторной работе №5
 * его можно было заменить на запросы к REST API, не трогая компоненты.
 *
 * @param {string} key            ключ в localStorage
 * @param {*}      initialValue   значение, если в хранилище пусто / данные битые
 * @param {object} options
 * @param {number} options.loadDelay  имитация загрузки с сервера, мс (по умолчанию 1000)
 * @param {number} options.debounce   задержка автосохранения после последнего изменения, мс (500)
 * @returns {{ value, setValue, loaded, saveStatus }}
 */
export function useLocalStorage(key, initialValue, { loadDelay = 1000, debounce = 500 } = {}) {
  const [value, setValue] = useState(initialValue)
  // loaded = false, пока данные ещё не прочитаны. Без этого флага эффект
  // сохранения успел бы затереть localStorage начальными данными.
  const [loaded, setLoaded] = useState(false)
  const [saveStatus, setSaveStatus] = useState('idle') // idle | saving | saved

  // Эффект №1 — загрузка при монтировании (пустой массив зависимостей).
  // setTimeout имитирует задержку ответа сервера; cleanup отменяет таймер
  // при размонтировании (и при двойном монтировании в StrictMode).
  useEffect(() => {
    const timerId = setTimeout(() => {
      let next = initialValue
      try {
        const raw = localStorage.getItem(key)
        if (raw !== null) {
          const parsed = JSON.parse(raw)
          // Принимаем только массив — иначе считаем данные повреждёнными
          if (Array.isArray(parsed)) next = parsed
        }
      } catch (err) {
        console.warn(`Не удалось прочитать "${key}" из localStorage:`, err)
      }
      setValue(next)
      setLoaded(true)
    }, loadDelay)

    return () => clearTimeout(timerId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  // Эффект №2 — сохранение при каждом изменении value с debounce.
  // Cleanup сбрасывает предыдущий таймер, поэтому запись происходит
  // только через `debounce` мс после ПОСЛЕДНЕГО изменения.
  useEffect(() => {
    if (!loaded) return

    setSaveStatus('saving')
    const timerId = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(value))
        setSaveStatus('saved')
      } catch (err) {
        console.warn(`Не удалось сохранить "${key}" в localStorage:`, err)
        setSaveStatus('idle')
      }
    }, debounce)

    return () => clearTimeout(timerId)
  }, [value, loaded, key, debounce])

  return { value, setValue, loaded, saveStatus }
}
