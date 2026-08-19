import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import styles from './Checkout.module.css';
import { CheckCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_NEST_URL;

const Checkout = () => {
  const { user, updateUser } = useAuth();
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState(user?.address || '');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Redirect to login if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/checkout');
    }
  }, [user, navigate]);

  // Redirect to cart if empty
  useEffect(() => {
    if (cart.length === 0 && !success) {
      navigate('/cart');
    }
  }, [cart, navigate, success]);

  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const delivery = subtotal > 0 ? 5000 : 0;
  const total = subtotal + delivery;

  const handlePayment = async (e: FormEvent) => {
    e.preventDefault();
    if (!address.trim()) {
      setError('Please provide a delivery address.');
      return;
    }

    if (cardNumber.length < 16) {
      setError('Please enter a valid 16-digit card number.');
      return;
    }
    
    if (expiry.length < 4 || cvc.length < 3) {
      setError('Please enter valid card details.');
      return;
    }

    setError('');
    setProcessing(true);

    try {
      // 1. Update User Address (if changed)
      const token = localStorage.getItem('tintin_token');
      if (address !== user?.address) {
        const addressRes = await fetch(`${API_BASE_URL}/auth/profile`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ address })
        });
        
        if (addressRes.ok) {
          updateUser({ address });
        } else {
          console.error("Failed to update address on backend");
        }
      }

      // 2. Mock Payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 3. (Future) Create order on backend 
      // await fetch(`${API_BASE_URL}/orders`, { ... })

      setSuccess(true);
      clearCart();
    } catch (err) {
      setError('An error occurred during payment processing. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (!user) return null;

  if (success) {
    return (
      <div className={`container ${styles.checkoutPage}`} style={{ textAlign: 'center', paddingTop: '5rem' }}>
        <CheckCircle size={80} color="var(--primary-color)" style={{ margin: '0 auto 1.5rem' }} />
        <h1 className={styles.title}>Payment Successful!</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: '#555' }}>
          Thank you for your order. Your new kicks will be arriving soon.
        </p>
        <button className={styles.saveBtn} onClick={() => navigate('/')}>Return to Store</button>
      </div>
    );
  }

  return (
    <div className={`container ${styles.checkoutPage}`}>
      <h1 className={styles.title}>Checkout</h1>
      
      {error && (
        <div style={{ backgroundColor: 'rgba(184, 58, 58, 0.1)', color: '#8f2d2d', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: 600 }}>
          {error}
        </div>
      )}

      <div className={styles.checkoutGrid}>
        <form onSubmit={handlePayment}>
          {/* Address Section */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>1. Delivery Address</h2>
            <div className={styles.formGroup}>
              <label>Full Address</label>
              <textarea 
                value={address} 
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your street address, city, state, and zip code"
                rows={4}
                required
              />
              <small style={{ color: '#666', marginTop: '0.25rem' }}>
                We'll save this address to your profile for future orders.
              </small>
            </div>
          </section>

          {/* Payment Section */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>2. Payment Method</h2>
            
            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
              <input type="radio" checked readOnly /> Credit / Debit Card
            </div>

            <div className={styles.formGroup}>
              <label>Card Number</label>
              <input 
                type="text" 
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                placeholder="0000 0000 0000 0000"
                required
              />
            </div>
            <div className={styles.cardGrid}>
              <div className={styles.formGroup}>
                <label>Expiry (MM/YY)</label>
                <input 
                  type="text" 
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  placeholder="MM/YY"
                  maxLength={5}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>CVC</label>
                <input 
                  type="text" 
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="123"
                  required
                />
              </div>
            </div>
          </section>

          <button 
            type="submit" 
            className={`${styles.saveBtn} ${styles.payBtn}`}
            disabled={processing}
          >
            {processing ? 'Processing Payment...' : `Pay ₦ ${total.toLocaleString()}`}
          </button>
        </form>

        {/* Order Summary */}
        <div>
          <div className={styles.section} style={{ position: 'sticky', top: '2rem' }}>
            <h2 className={styles.sectionTitle}>Order Summary</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src={item.image} alt={item.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>Size: {item.size} • Qty: {item.quantity}</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>₦ {(item.price * item.quantity).toLocaleString()}</div>
                </div>
              ))}
            </div>

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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
