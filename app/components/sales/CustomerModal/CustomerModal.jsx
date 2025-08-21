'use client';

import React, { useState, useEffect } from 'react';
import './CustomerModal.css';

const CustomerModal = ({
  mode,
  customers,
  selectedCustomer,
  setSelectedCustomer,
  setUserModalMode,
  handleCreateCustomer,
  handleEditCustomer
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customerForm, setCustomerForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when editing
  useEffect(() => {
    if (mode === 'edit' && selectedCustomer) {
      setCustomerForm({
        name: selectedCustomer.name || '',
        email: selectedCustomer.email || '',
        phone: selectedCustomer.phone || '',
        address: selectedCustomer.address || ''
      });
    } else if (mode === 'create') {
      setCustomerForm({
        name: '',
        email: '',
        phone: '',
        address: ''
      });
    }
  }, [mode, selectedCustomer]);

  const filteredCustomers = customers.filter(customer =>
    (customer.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.phone || '').includes(searchTerm)
  );

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // basic client-side validation
    if (!customerForm.name || !customerForm.email) {
      alert('Name and email are required!');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'create') {
        // parent handler should return true on success
        const ok = await handleCreateCustomer(customerForm);
        if (ok) {
          setCustomerForm({ name: '', email: '', phone: '', address: '' });
        }
      } else if (mode === 'edit') {
        const ok = await handleEditCustomer(customerForm);
        // parent handler is expected to close the modal on success
        if (!ok) {
          // if parent returns false, keep modal open so user can fix issues
          // you could show additional UI here if desired
        }
      }
    } catch (err) {
      console.error('Customer modal submit error:', err);
      alert(err?.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setCustomerForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const closeModal = () => {
    setUserModalMode(null);
    setSearchTerm('');
    setCustomerForm({ name: '', email: '', phone: '', address: '' });
  };

  const selectCustomer = (customer) => {
    setSelectedCustomer(customer);
    closeModal();
  };

  return (
    <div className="customer-modal-overlay" onClick={closeModal}>
      <div className="customer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="customer-modal-header">
          <h2 className="customer-modal-title">
            <svg className="customer-modal-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            {mode === 'select' && 'Select Customer'}
            {mode === 'create' && 'Create New Customer'}
            {mode === 'edit' && 'Edit Customer'}
          </h2>
          <button className="customer-modal-close" onClick={closeModal} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="customer-modal-content">
          {mode === 'select' ? (
            <>
              {/* Search */}
              <div className="customer-modal-search">
                <div className="customer-search-input-wrapper">
                  <svg className="customer-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <circle cx="11" cy="11" r="8"/>
                    <path d="M21 21l-4.35-4.35"/>
                  </svg>
                  <input
                    type="text"
                    className="customer-search-input"
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Customer List */}
              <div className="customer-modal-list">
                {filteredCustomers.length === 0 ? (
                  <div className="customer-modal-empty">
                    <svg className="customer-modal-empty-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <p>No customers found</p>
                    <p className="customer-modal-empty-subtitle">
                      {searchTerm ? 'Try a different search term' : 'Create your first customer to get started'}
                    </p>
                  </div>
                ) : (
                  filteredCustomers.map(customer => (
                    <div
                      key={customer.id}
                      className={`customer-modal-item ${selectedCustomer?.id === customer.id ? 'selected' : ''}`}
                      onClick={() => selectCustomer(customer)}
                    >
                      <div className="customer-modal-item-avatar" aria-hidden>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                      </div>
                      <div className="customer-modal-item-info">
                        <h4 className="customer-modal-item-name">{customer.name}</h4>
                        <p className="customer-modal-item-email">{customer.email}</p>
                        {customer.phone && (
                          <p className="customer-modal-item-phone">{customer.phone}</p>
                        )}
                      </div>
                      <div className="customer-modal-item-check" aria-hidden>
                        {selectedCustomer?.id === customer.id && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20,6 9,17 4,12"/>
                          </svg>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            /* Create/Edit Form */
            <form className="customer-modal-form" onSubmit={handleFormSubmit}>
              <div className="customer-modal-form-group">
                <label className="customer-modal-label">
                  Name <span className="customer-modal-required">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className="customer-modal-input"
                  value={customerForm.name}
                  onChange={handleFormChange}
                  placeholder="Customer name"
                  required
                />
              </div>

              <div className="customer-modal-form-group">
                <label className="customer-modal-label">
                  Email <span className="customer-modal-required">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  className="customer-modal-input"
                  value={customerForm.email}
                  onChange={handleFormChange}
                  placeholder="customer@example.com"
                  required
                />
              </div>

              <div className="customer-modal-form-group">
                <label className="customer-modal-label">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  className="customer-modal-input"
                  value={customerForm.phone}
                  onChange={handleFormChange}
                  placeholder="555-0123"
                />
              </div>

              <div className="customer-modal-form-group">
                <label className="customer-modal-label">Address</label>
                <textarea
                  name="address"
                  className="customer-modal-textarea"
                  value={customerForm.address}
                  onChange={handleFormChange}
                  placeholder="Customer address"
                  rows="3"
                />
              </div>

              <div className="customer-modal-form-actions">
                <button
                  type="button"
                  className="customer-modal-btn customer-modal-btn-secondary"
                  onClick={closeModal}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="customer-modal-btn customer-modal-btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (mode === 'create' ? 'Creating…' : 'Updating…') : (mode === 'create' ? 'Create Customer' : 'Update Customer')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerModal;
