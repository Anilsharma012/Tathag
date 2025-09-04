import React, { useEffect, useRef } from 'react';
import { FiX } from 'react-icons/fi';
import './Drawer.css';

const Drawer = ({
  isOpen = false,
  onClose,
  title,
  children,
  size = 'default', // 'small', 'default', 'large'
  position = 'right', // 'left', 'right'
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = '',
  headerActions = null
}) => {
  const drawerRef = useRef(null);
  const previousFocus = useRef(null);

  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, closeOnEscape, onClose]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement;
      // Focus the drawer container
      if (drawerRef.current) {
        drawerRef.current.focus();
      }
    } else if (previousFocus.current) {
      // Return focus to previous element
      previousFocus.current.focus();
    }
  }, [isOpen]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const getSizeClass = () => {
    const sizes = {
      small: 'drawer-small',
      default: 'drawer-default', 
      large: 'drawer-large'
    };
    return sizes[size] || sizes.default;
  };

  return (
    <div 
      className={`drawer-overlay ${isOpen ? 'drawer-overlay-open' : ''}`}
      onClick={handleOverlayClick}
    >
      <div 
        ref={drawerRef}
        className={`drawer drawer-${position} ${getSizeClass()} ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "drawer-title" : undefined}
        tabIndex={-1}
      >
        {(title || showCloseButton || headerActions) && (
          <div className="drawer-header">
            <div className="drawer-header-content">
              {title && (
                <h2 id="drawer-title" className="drawer-title">
                  {title}
                </h2>
              )}
              <div className="drawer-header-actions">
                {headerActions}
                {showCloseButton && (
                  <button
                    className="drawer-close-button"
                    onClick={onClose}
                    aria-label="Close drawer"
                  >
                    <FiX />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="drawer-content">
          {children}
        </div>
      </div>
    </div>
  );
};

// Form Drawer variant for forms
export const FormDrawer = ({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  submitDisabled = false,
  submitLoading = false,
  ...drawerProps
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      {...drawerProps}
    >
      <form onSubmit={handleSubmit} className="form-drawer-content">
        <div className="form-drawer-body">
          {children}
        </div>
        
        <div className="form-drawer-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            {cancelLabel}
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitDisabled || submitLoading}
          >
            {submitLoading ? 'Saving...' : submitLabel}
          </button>
        </div>
      </form>
    </Drawer>
  );
};

export default Drawer;
