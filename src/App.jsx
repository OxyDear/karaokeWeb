import SongList from './components/SongList'

export default function App() {
  return (
    <div className="container">
      <header className="hero">
        <h1>🎤 Онлайн-караоке</h1>
        <p>Управляйте каталогом песен: данные хранятся в localStorage браузера.</p>
      </header>
      <SongList />
    </div>
  )
}
