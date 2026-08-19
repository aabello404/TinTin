import { useState, useEffect, type TouchEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import styles from "./Home.module.css";
import ProductCard from "../components/ProductCard";

type Listing = {
  id: string;
  name: string;
  price: number;
  images: { url: string }[];
};

const Home = () => {
  const location = useLocation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [products, setProducts] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_NEST_URL;
        const response = await fetch(`${API_BASE_URL}/listings`);
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch listings", error);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  const featuredShoes = products.slice(0, 5); // Slideshow uses first 5

  useEffect(() => {
    if (featuredShoes.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === featuredShoes.length - 1 ? 0 : prev + 1,
      );
    }, 5000);
    return () => clearInterval(timer);
  }, [featuredShoes.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) =>
      prev === featuredShoes.length - 1 ? 0 : prev + 1,
    );
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? featuredShoes.length - 1 : prev - 1,
    );
  };

  const handleTouchStart = (e: TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div className={styles.home}>
      {location.state?.signupSuccess && (
        <div className={styles.signupSuccess}>
          {location.state.signupSuccess}
        </div>
      )}
      {featuredShoes.length > 0 && (
        <div
          className={styles.slideshowContainer}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {featuredShoes.map((shoe, index) => (
            <Link to={`/product/${shoe.id}`}>
              <div
                key={shoe.id}
                className={`${styles.slide} ${index === currentSlide ? styles.active : ""}`}
              >
                <img
                  src={shoe.images?.[0]?.url || "/hero.png"}
                  alt={shoe.name}
                />
                <div className={styles.slideContent}>
                  <h2 className={styles.slideTitle}>{shoe.name}</h2>
                  <p className={styles.slidePrice}>
                    ₦ {shoe.price.toLocaleString()}
                  </p>
                </div>
              </div>
            </Link>
          ))}

          <button
            className={`${styles.navButton} ${styles.prev}`}
            onClick={prevSlide}
          >
            <ChevronLeft size={24} />
          </button>
          <button
            className={`${styles.navButton} ${styles.next}`}
            onClick={nextSlide}
          >
            <ChevronRight size={24} />
          </button>
        </div>
      )}

      <div className="container">
        <h2 className={styles.sectionTitle}>Featured Collection</h2>
        <div className="grid-auto-fit">
          {loading ? (
            <p style={{ textAlign: "center", gridColumn: "1 / -1" }}>
              Loading products...
            </p>
          ) : products.length > 0 ? (
            products.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  ...product,
                  image: product.images?.[0]?.url || "/hero.png",
                }}
              />
            ))
          ) : (
            <p style={{ textAlign: "center", gridColumn: "1 / -1" }}>
              No products found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
