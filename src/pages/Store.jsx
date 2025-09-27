// src/pages/Store.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  updateDoc,
  doc,
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../services/firebase';

const Store = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Product form state
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: 0,
    image: null,
    category: '',
    stock: 0
  });

  // Check if user is verified (you'll need to implement verification logic)
  const isVerified = user?.emailVerified; // Or your custom verification system

  // Fetch user's products
  const fetchProducts = async () => {
    try {
      const q = query(
        collection(db, 'products'),
        where('ownerId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);
      const userProducts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(userProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  // Handle image upload
  const handleImageUpload = async (file) => {
    const storageRef = ref(storage, `products/${user.uid}/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  // Add new product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!isVerified) {
      alert('You need to be verified to create a store');
      return;
    }

    setLoading(true);
    try {
      let imageUrl = '';
      if (productData.image) {
        imageUrl = await handleImageUpload(productData.image);
      }

      await addDoc(collection(db, 'products'), {
        ...productData,
        price: Number(productData.price),
        stock: Number(productData.stock),
        imageUrl,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
        isActive: true
      });

      setProductData({
        name: '',
        description: '',
        price: 0,
        image: null,
        category: '',
        stock: 0
      });
      setShowForm(false);
      fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isVerified) {
    return (
      <div className="store-container">
        <div className="verification-required">
          <h2>Store Management</h2>
          <p>You need to be verified to create and manage a store.</p>
          <button onClick={() => {/* Navigate to verification */}}>
            Get Verified
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="store-container">
      <div className="store-header">
        <h2>Your Store</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          {showForm ? 'Cancel' : 'Add Product'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddProduct} className="product-form">
          <input
            type="text"
            placeholder="Product Name"
            value={productData.name}
            onChange={(e) => setProductData({...productData, name: e.target.value})}
            required
          />
          <textarea
            placeholder="Description"
            value={productData.description}
            onChange={(e) => setProductData({...productData, description: e.target.value})}
            required
          />
          <input
            type="number"
            placeholder="Price"
            value={productData.price}
            onChange={(e) => setProductData({...productData, price: e.target.value})}
            required
          />
          <input
            type="number"
            placeholder="Stock"
            value={productData.stock}
            onChange={(e) => setProductData({...productData, stock: e.target.value})}
            required
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setProductData({...productData, image: e.target.files[0]})}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Product'}
          </button>
        </form>
      )}

      <div className="products-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <img src={product.imageUrl} alt={product.name} />
            <h3>{product.name}</h3>
            <p>${product.price}</p>
            <p>Stock: {product.stock}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Store;