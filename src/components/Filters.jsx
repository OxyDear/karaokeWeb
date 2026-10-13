// Панель фильтрации и сортировки. Само состояние хранится в родителе (SongList),
// здесь только отображение и вызов onChange.
export default function Filters({ filters, genres, onChange }) {
  const set = (name) => (e) => onChange({ ...filters, [name]: e.target.value })

  return (
    <div className="filter-bar">
      <input
        type="search"
        placeholder="Поиск по названию или исполнителю"
        value={filters.query}
        onChange={set('query')}
      />
      <select value={filters.genre} onChange={set('genre')}>
        <option value="">Все жанры</option>
        {genres.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>
      <select value={filters.status} onChange={set('status')}>
        <option value="all">Все песни</option>
        <option value="todo">Не спеты</option>
        <option value="sung">Спеты</option>
      </select>
      <select value={filters.sort} onChange={set('sort')}>
        <option value="added">Сначала новые</option>
        <option value="title">По названию (А–Я)</option>
        <option value="artist">По исполнителю (А–Я)</option>
        <option value="duration">По длительности ↑</option>
      </select>
    </div>
  )
}
