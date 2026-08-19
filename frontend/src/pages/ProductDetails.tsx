import { useRef, useState, useEffect, type TouchEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useCart } from "../context/CartContext";
import styles from "./ProductDetails.module.css";

const SIZES = [39, 40, 41, 42, 43, 44, 45, 46, 47];

type Listing = {
  id: string;
  name: string;
  price: number;
  description: string;
  images: { url: string }[];
};

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, wishlist, addToWishlist, removeFromWishlist } = useCart();
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [product, setProduct] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await fetch(`http://localhost:3000/listings/${id}`);
        if (!response.ok) {
          navigate("/");
          return;
        }
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error("Failed to fetch listing", error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchListing();
    }
  }, [id, navigate]);

  const handleAddToBasket = () => {
    if (!selectedSize || !product) {
      return;
    }

    addToCart({
      id: "", // Generated in context
      productId: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      quantity: 1,
      image: product.images?.[0]?.url || "/hero.png",
    });
  };

  const nextImage = () => {
    if (product && product.images && product.images.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === product.images.length - 1 ? 0 : prev + 1,
      );
    }
  };

  const prevImage = () => {
    if (product && product.images && product.images.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? product.images.length - 1 : prev - 1,
      );
    }
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;

    const touchEndX = event.changedTouches[0]?.clientX;
    if (touchEndX === undefined) return;

    const swipeDistance = touchEndX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(swipeDistance) < 40) return;
    if (swipeDistance < 0) nextImage();
    else prevImage();
  };

  if (loading) {
    return (
      <div
        className="container"
        style={{ padding: "3rem 0", textAlign: "center" }}
      >
        Loading...
      </div>
    );
  }

  if (!product) {
    return (
      <div
        className="container"
        style={{ padding: "3rem 0", textAlign: "center" }}
      >
        Product not found.
      </div>
    );
  }

  const hasMultipleImages = product.images && product.images.length > 1;

  return (
    <div className={`container ${styles.productContainer}`}>
      <div
        className={styles.imageSection}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={product.images?.[currentImageIndex]?.url || "/hero.png"}
          alt={product.name}
        />

        {hasMultipleImages && (
          <>
            <button
              className={`${styles.navButton} ${styles.prev}`}
              onClick={prevImage}
            >
              <ChevronLeft size={24} />
            </button>
            <button
              className={`${styles.navButton} ${styles.next}`}
              onClick={nextImage}
            >
              <ChevronRight size={24} />
            </button>
            <div className={styles.imageIndicators}>
              {product.images.map((_, idx) => (
                <div
                  key={idx}
                  className={`${styles.indicator} ${idx === currentImageIndex ? styles.active : ""}`}
                  onClick={() => setCurrentImageIndex(idx)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className={styles.detailsSection}>
        <h1 className={styles.title}>{product.name}</h1>
        <div className={styles.price}>₦ {product.price.toLocaleString()}</div>

        <p className={styles.description}>
          {product.description || "No description available."}
        </p>

        <div className={styles.sizeSection}>
          <h3>Select Size</h3>
          <div className={styles.sizeGrid}>
            {SIZES.map((size) => (
              <button
                key={size}
                className={`${styles.sizeBtn} ${selectedSize === size ? styles.selected : ""}`}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.addToBasketBtn} onClick={handleAddToBasket}>
            Add to Basket
          </button>
          <button
            className={styles.wishlistBtn}
            onClick={() => {
              if (!product) return;
              const isInWishlist = wishlist.some(
                (i) => i.productId === product.id,
              );
              if (isInWishlist) {
                removeFromWishlist(product.id);
              } else {
                addToWishlist({
                  productId: product.id,
                  name: product.name,
                  price: product.price,
                  image: product.images?.[0]?.url || "/hero.png",
                });
              }
            }}
          >
            <Heart
              size={24}
              style={{ margin: "0 auto" }}
              fill={
                product && wishlist.some((i) => i.productId === product.id)
                  ? "currentColor"
                  : "none"
              }
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
