import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useCart } from '../context/CartContext';
import styles from './ProductCard.module.css';

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
};

const SIZES = [39, 40, 41, 42, 43, 44, 45, 46, 47];

const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart, wishlist, addToWishlist, removeFromWishlist } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);

  const handleConfirmAdd = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    
    addToCart({
      id: '', // Generated in context
      productId: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize, 
      quantity: 1,
      image: product.image
    });
    
    setIsModalOpen(false);
    setSelectedSize(null);
  };

  return (
    <div className={styles.card}>
      <Link to={`/product/${product.id}`} className={styles.imageContainer}>
        <img src={product.image} alt={product.name} className={styles.image} />
      </Link>
      <div className={styles.content}>
        <Link to={`/product/${product.id}`}>
          <h3 className={styles.title}>{product.name}</h3>
          <p className={styles.price}>₦ {product.price.toLocaleString()}</p>
        </Link>
        <div className={styles.actions}>
          <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
            <Dialog.Trigger asChild>
              <button className={styles.addToBasketBtn}>
                Add to Basket
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className={styles.dialogOverlay} />
              <Dialog.Content className={styles.dialogContent}>
                <Dialog.Title className={styles.dialogTitle}>Select Size for {product.name}</Dialog.Title>
                <div className={styles.sizeGrid}>
                  {SIZES.map(size => (
                    <button 
                      key={size}
                      className={`${styles.sizeBtn} ${selectedSize === size ? styles.selected : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                <div className={styles.dialogActions}>
                  <Dialog.Close asChild>
                    <button className={styles.cancelBtn}>Cancel</button>
                  </Dialog.Close>
                  <button onClick={handleConfirmAdd}>Add to Basket</button>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>

          <button 
            className={styles.wishlistBtn} 
            onClick={(e) => { 
              e.preventDefault(); 
              const isInWishlist = wishlist.some(i => i.productId === product.id);
              if (isInWishlist) {
                removeFromWishlist(product.id);
              } else {
                addToWishlist({
                  productId: product.id,
                  name: product.name,
                  price: product.price,
                  image: product.image
                });
              }
            }}
          >
            <Heart size={20} fill={wishlist.some(i => i.productId === product.id) ? "currentColor" : "none"} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
