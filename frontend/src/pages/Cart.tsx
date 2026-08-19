import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import styles from './Cart.module.css';

const Cart = () => {
  const { cart, removeFromCart, addToCart } = useCart();

  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const delivery = subtotal > 0 ? 5000 : 0; // Flat delivery fee if cart is not empty
  const total = subtotal + delivery;

  if (cart.length === 0) {
    return (
      <div className={`container ${styles.cartPage}`}>
        <h1 className={styles.title}>Your Basket</h1>
        <div className={styles.emptyState}>
          <h2>Your basket is empty</h2>
          <p style={{ margin: '1rem 0 2rem' }}>Looks like you haven't added any shoes to your basket yet.</p>
          <Link to="/">
            <button>Continue Shopping</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`container ${styles.cartPage}`}>
      <h1 className={styles.title}>Your Basket</h1>
      
      <div className={styles.cartGrid}>
        <div className={styles.itemsList}>
          {cart.map((item) => (
            <div key={item.id} className={styles.cartItem}>
              <img src={item.image} alt={item.name} className={styles.itemImage} />
              
              <div className={styles.itemDetails}>
                <div className={styles.itemHeader}>
                  <div>
                    <h3 className={styles.itemName}>{item.name}</h3>
                    <div className={styles.itemSize}>Size: {item.size}</div>
                  </div>
                  <div className={styles.itemPrice}>₦ {(item.price * item.quantity).toLocaleString()}</div>
                </div>
                
                <div className={styles.itemActions}>
                  <div className={styles.quantityControl}>
                    <button 
                      className={styles.quantityBtn}
                      onClick={() => {
                        if (item.quantity > 1) {
                          // addToCart with negative quantity acts as subtract (or we can just use set state directly in context if we had an update method, 
                          // but since we only have addToCart, we can pass quantity: -1).
                          // However, addToCart finds existing by productId & size and adds the quantity.
                          addToCart({ ...item, quantity: -1 });
                        } else {
                          removeFromCart(item.id);
                        }
                      }}
                    >
                      <Minus size={16} />
                    </button>
                    <span className={styles.quantityValue}>{item.quantity}</span>
                    <button 
                      className={styles.quantityBtn}
                      onClick={() => addToCart({ ...item, quantity: 1 })}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  
                  <button className={styles.removeBtn} onClick={() => removeFromCart(item.id)}>
                    <Trash2 size={16} />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div>
          <div className={styles.summary}>
            <h3 className={styles.summaryTitle}>Order Summary</h3>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>₦ {subtotal.toLocaleString()}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Estimated Delivery</span>
              <span>₦ {delivery.toLocaleString()}</span>
            </div>
            <div className={styles.summaryTotal}>
              <span>Total</span>
              <span>₦ {total.toLocaleString()}</span>
            </div>
            
            <Link to="/checkout" style={{ display: 'block', textDecoration: 'none' }}>
              <button className={styles.checkoutBtn}>Proceed to Checkout</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
