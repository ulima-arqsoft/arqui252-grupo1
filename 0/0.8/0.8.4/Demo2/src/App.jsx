import "./App.css";

function App() {
  return (
    <div className="container">
      <div className="banner">
        <h2>🔥Laptops - Encuentra Laptops de las mejores marcas en PROMOCIÓN.</h2>
      </div>

      <div className="cards">
        <div className="card">
          <img
            src="/Imagen-laptop.jpg"
            alt="Laptop 1"
          />
          <h3>Laptop Lenovo Ideapad Slim 3</h3>
          <p>16GB RAM · Intel i5 · RTX 4060</p>
          <button>Comprar Ahora</button>
        </div>

        <div className="card">
          <img
            src="/Imagen-laptop2.jpg"
            alt="Laptop 2"
          />
          <h3>Laptop Gamer IA Lenovo LOQ</h3>
          <p>24GB RAM · Intel i9 · RTX 5050</p>
          <button>Comprar Ahora</button>
        </div>
      </div>
    </div>
  );
}

export default App;
