import { Link } from 'react-router-dom';
import { HeartOff } from 'lucide-react';
import { useCart } from '../context/CartContext';
import styles from './Cart.module.css'; // Reusing some cart layout styles
import ProductCard from '../components/ProductCard';

const Wishlist = () => {
  const { wishlist } = useCart();

  if (wishlist.length === 0) {
    return (
      <div className={`container ${styles.cartPage}`}>
        <h1 className={styles.title}>Your Wishlist</h1>
        <div className={styles.emptyState}>
          <HeartOff size={48} style={{ color: '#ccc', marginBottom: '1rem' }} />
          <h2>Your wishlist is empty</h2>
          <p style={{ margin: '1rem 0 2rem' }}>Save items you love here by clicking the heart icon.</p>
          <Link to="/">
            <button>Browse Shoes</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`container ${styles.cartPage}`}>
      <h1 className={styles.title}>Your Wishlist</h1>
      
      <div className="grid-auto-fit">
        {wishlist.map(item => (
          <ProductCard 
            key={item.productId} 
            product={{
              id: item.productId,
              name: item.name,
              price: item.price,
              image: item.image
            }} 
          />
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
