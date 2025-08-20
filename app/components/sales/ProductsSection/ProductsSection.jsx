'use client';
import React, { useState, useMemo } from 'react';
import './ProductsSection.css';

const safeId = (product) => {
  if (!product) return '';
  if (product.id) return String(product.id);
  if (!product._id) return '';
  // _id might be a string or an ObjectId-like with toString()
  if (typeof product._id === 'string') return product._id;
  if (product._id.toString) return product._id.toString();
  try {
    return JSON.stringify(product._id);
  } catch {
    return String(product._id);
  }
};

const ProductsSection = ({ products = [], addToCart }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // build a safe array of categories (use product.category or 'General')
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => (p?.category || 'General')));
    return ['All', ...Array.from(cats)];
  }, [products]);

  const normalized = useMemo(
    () => products.map(p => {
      const id = safeId(p);
      const title = p.title ?? p.name ?? 'Untitled';
      const desc = p.desc ?? '';
      const category = p.category ?? 'General';
      // Use itemPrice as the individual item price
      const itemPrice = Number(p.itemPrice ?? 0) || 0;
      // Use purchasePrice as the stock purchase price
      const purchasePrice = Number(p.purchasePrice ?? 0) || 0;
      const barcode = p.barcode ?? id;
      const totalItems = Number(p.totalItems ?? 0);
      return { 
        ...p, 
        id, 
        title, 
        desc, 
        category, 
        itemPrice, 
        purchasePrice, 
        barcode, 
        totalItems 
      };
    }),
    [products]
  );

  const filteredProducts = normalized.filter((product) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch = q === '' ||
      (product.title && product.title.toLowerCase().includes(q)) ||
      (product.desc && product.desc.toLowerCase().includes(q)) ||
      (product.barcode && String(product.barcode).includes(q));

    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const formatPKR = (amount) =>
    new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR'
    }).format(amount || 0);

  return (
    <div className="products-section">
      <div className="products-card">
        <div className="products-card-body">
          <h2 className="products-section-title">
            <svg
              className="products-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
            Products
          </h2>

          {/* Search and Filter */}
          <div className="products-search-filters">
            <div className="products-search-container">
              <div className="search-input-wrapper">
                <svg
                  className="search-icon"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21l-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  className="products-search-input"
                  placeholder="Search products or scan barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="products-filter-container">
              <select
                className="products-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Product Grid */}
          <div className="products-product-grid">
            {filteredProducts.length === 0 && (
              <div className="no-products">No products found</div>
            )}

            {filteredProducts.map(product => (
              <div
                key={product.id || product.barcode}
                className="products-product-card"
                onClick={() => addToCart(product)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addToCart(product);
                }}
                aria-label={`Add ${product.title} to cart`}
              >
                <div className="products-product-info">
                  <h6 className="products-product-name">{product.title}</h6>
                  <p className="products-product-category">{product.category}</p>
                  <p className="products-product-price">{formatPKR(product.itemPrice)}</p>
                  <p className="products-product-stock">Stock: {product.totalItems}</p>
                  <p className="products-stock-purchase-price">Stock Purchase Price: {formatPKR(product.purchasePrice)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsSection;