import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

type Listing = {
  id: string;
  name: string;
  price: number;
  images: { url: string }[];
};

const Category = () => {
  const { id } = useParams();
  const [products, setProducts] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryListings = async () => {
      setLoading(true);
      try {
        const API_BASE_URL = import.meta.env.VITE_NEST_URL;
        const response = await fetch(`${API_BASE_URL}/listings?category=${id}`);
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch category listings', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (id !== 'women' && id !== 'kids') {
      fetchCategoryListings();
    } else {
      setLoading(false);
    }
  }, [id]);

  if (id === 'women' || id === 'kids') {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center', minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2>check back nothing here yet!</h2>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '3rem 0' }}>
      <h2 style={{ textTransform: 'uppercase', marginBottom: '2rem' }}>{id} Collection</h2>
      <div className="grid-auto-fit">
        {loading ? (
          <p>Loading...</p>
        ) : products.length > 0 ? (
          products.map(product => (
            <ProductCard 
              key={product.id} 
              product={{ ...product, image: product.images?.[0]?.url || '/hero.png' }} 
            />
          ))
        ) : (
          <p>No products found in this category.</p>
        )}
      </div>
    </div>
  );
};

export default Category;
