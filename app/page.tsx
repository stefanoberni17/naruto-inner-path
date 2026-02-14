export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-orange-50 to-orange-100">
      <div className="text-center space-y-8">
        <div className="text-6xl">🍥</div>
        <h1 className="text-5xl font-bold text-orange-600">
          Naruto Inner Path
        </h1>
        <p className="text-xl text-gray-700">
          La via del Guerriero Gentile
        </p>
        <p className="text-lg text-gray-600 max-w-md mx-auto">
          Più di un anime. Un viaggio per crescere.
        </p>
        <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105">
          🚀 Inizia il Percorso
        </button>
      </div>
    </main>
  );
}