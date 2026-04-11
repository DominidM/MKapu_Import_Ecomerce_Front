"use client";

interface Props {
  cats: string[];
  active: string;
  onChange: (cat: string) => void;
}

export default function CategoryMenu({ cats, active, onChange }: Props) {
  return (
    <div className="cat-menu" role="navigation" aria-label="Categorías">
      {cats.map((cat) => (
        <button
          key={cat}
          className={`cat-menu__btn${active === cat ? " cat-menu__btn--active" : ""}`}
          onClick={() => onChange(cat)}
          aria-pressed={active === cat}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
