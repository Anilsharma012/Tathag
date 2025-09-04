// Demo course purchase utility for testing
export const demoPurchaseCourse = async (courseId) => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('Please login first!');
      return false;
    }

    // Step 1: Create order
    const orderResponse = await fetch('/api/user/payment/create-order', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount: 150000 }) // ₹1500 in paise
    });

    const orderData = await orderResponse.json();
    if (!orderData.success) {
      alert('Failed to create order: ' + orderData.message);
      return false;
    }

    // Step 2: Simulate payment verification (demo mode)
    const verifyResponse = await fetch('/api/user/payment/verify-and-unlock', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        razorpay_order_id: 'demo_order_' + Date.now(),
        razorpay_payment_id: 'demo_payment_' + Date.now(),
        razorpay_signature: 'demo_signature',
        courseId: courseId
      })
    });

    const verifyData = await verifyResponse.json();
    if (verifyData.success) {
      alert('✅ Demo course purchase successful!');
      return true;
    } else {
      alert('❌ Purchase verification failed: ' + verifyData.message);
      return false;
    }

  } catch (error) {
    console.error('Demo purchase error:', error);
    alert('❌ Purchase failed: ' + error.message);
    return false;
  }
};
