"use client";
import { useState, useEffect } from "react";
import { Category } from "@/data/menu";

interface Props { categories: Category[]; }

export default function CategoryNav({ categories }: Props) {
  const [active, setActive] = useState(categories[0]?.id ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    categories.forEach((cat) => {
      const el = document.getElementById(cat.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [categories]);

  return (
    <nav className="sticky top-[57px] z-20 bg-cream/90 backdrop-blur-md border-b border-brand-100 overflow-x-auto">
      <div className="max-w-4xl mx-auto px-4 py-2 flex gap-2 w-max">
        {categories.map((cat) => (
          <a
            key={cat.id}
            href={`#${cat.id}`}
            onClick={() => setActive(cat.id)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-bold transition-all ${
              active === cat.id
                ? "bg-brand-400 text-white"
                : "text-brand-600 hover:bg-brand-50"
            }`}
          >
            {cat.name}
          </a>
        ))}
      </div>
    </nav>
  );
}
