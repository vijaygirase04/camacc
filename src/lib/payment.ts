interface CartItem {
  id: string;
  price: number;
  [key: string]: unknown;
}

export const initiateCheckout = async (items: CartItem[], type: 'stripe' | 'razorpay' = 'stripe') => {
  console.log(`Initiating ${type} checkout for ${items.length} items`);
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  if (type === 'stripe') {
    // In a real app, redirect to Stripe Checkout
    return { url: 'https://checkout.stripe.com/pay/mock_session' };
  } else {
    // In a real app, initialize Razorpay standard checkout
    return { success: true, order_id: 'order_' + Math.random().toString(36).slice(2) };
  }
};
