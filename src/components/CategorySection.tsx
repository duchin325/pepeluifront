import { Category } from "@/data/menu";
import ProductCard from "./ProductCard";

interface Props {
  category: Category;
}

export default function CategorySection({ category }: Props) {
  const available = category.products.filter((p) => p.available);
  const unavailable = category.products.filter((p) => !p.available);
  const sorted = [...available, ...unavailable];

  return (
    <section id={category.id} className="scroll-mt-20">
      <h2
        className="text-2xl font-bold text-charcoal mb-4"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {category.name}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {sorted.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
