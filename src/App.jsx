import React, { useState } from "react";
import "./App.css";

const API_URL =
  "https://api.thecatapi.com/v1/images/search?has_breeds=1&limit=1";

const APIKEY = import.meta.env.VITE_APIKEY;

const headers = { "x-api-key": APIKEY };
fetch(API_URL, { headers });

export default function App() {
  const [cat, setCat] = useState(null);
  const [banList, setBanList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCat = async () => {
    setLoading(true);
    setError(null);

    for (let attempts = 0; attempts < 10; attempts++) {
      try {
        const res = await fetch(API_URL, { headers });
        const data = await res.json();
        if (!data?.length) throw new Error("Empty response");

        const img = data[0];
        const breed = img.breeds?.[0];
        if (!breed) continue;

        const origin = breed.origin;
        const lifeSpan = breed.life_span;
        const name = breed.name;
        if (
          banList.includes(origin) ||
          banList.includes(lifeSpan) ||
          banList.includes(name)
        ) continue;

        setCat({
          id: img.id,
          url: img.url,
          name,
          origin,
          life_span: lifeSpan,
        });
        setLoading(false);
        return;
      } catch (err) {
        console.error(err);
        setError("Failed to fetch cat");
        setLoading(false);
        return;
      }
    }

    setError("No more cats match your criteria!");
    setLoading(false);
  };

  const addToBan = (value) =>
    !banList.includes(value) && setBanList([...banList, value]);
  const removeFromBan = (value) =>
    setBanList(banList.filter((v) => v !== value));

  return (
    <main className="app">
      <h1>Stumble Cats</h1>
      <p className="subtitle">
        Stumble upon some cool cats!
      </p>

      {cat && (
        <section className="card">
          <h2
            className="cat-name"
            onClick={() => addToBan(cat.origin)}
            title="Click to ban this origin"
          >
            {cat.name}
          </h2>

          <div className="tags">
            <button
              className="tag click"
              onClick={() => addToBan(cat.origin)}
            >
              {cat.origin}
            </button>
            <span
              className="tag"
              onClick={() => addToBan(cat.life_span)}
              title="Click to ban this age"
              style={{ cursor: "pointer" }}
            >
              {cat.life_span} yrs
            </span>
            <button
              className="tag click"
              onClick={() => addToBan(cat.name)}
              title="Click to ban this breed"
            >
              {cat.name}
            </button>
          </div>

          <img src={cat.url} alt={cat.name} />
        </section>
      )}

      <div className="controls">
        <button
          className="discover-btn"
          onClick={fetchCat}
          disabled={loading}
        >
          {loading ? "Loading…" : "Discover"}
        </button>
        {error && <p className="error">{error}</p>}
      </div>

      <aside className="ban-list">
        <h3>Ban List</h3>
        {banList.length === 0 && <p className="empty">(empty)</p>}

        {banList.map((item) => (
          <button
            key={item}
            className="tag banned"
            onClick={() => removeFromBan(item)}
            title="Click to remove ban"
          >
            {item} ×
          </button>
        ))}
      </aside>
    </main>
  );
}
