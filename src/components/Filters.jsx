// Панель поиска и сортировки. Состояние хранится в родителе (SongList).
// Поиск и жанр отправляются на сервер (query-параметры search/genre),
// сортировка выполняется на клиенте над уже загруженным списком.
export default function Filters({ filters, genres, searching, onChange }) {
  const set = (name) => (e) => onChange({ ...filters, [name]: e.target.value })

  return (
    <div className="filter-bar">
      <div className="search-wrap">
        <input
          type="search"
          placeholder="Поиск по названию или исполнителю (на сервере)"
          value={filters.query}
          onChange={set('query')}
        />
        {searching && <span className="spinner spinner-sm" aria-label="Поиск…" />}
      </div>
      <select value={filters.genre} onChange={set('genre')}>
        <option value="">Все жанры</option>
        {genres.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>
      <select value={filters.sort} onChange={set('sort')}>
        <option value="added">Сначала новые</option>
        <option value="plays">По популярности</option>
        <option value="title">По названию (А–Я)</option>
        <option value="artist">По исполнителю (А–Я)</option>
        <option value="duration">По длительности ↑</option>
      </select>
    </div>
  )
}
