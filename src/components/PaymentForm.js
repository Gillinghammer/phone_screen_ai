import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';

export default function PaymentForm({ user, company, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      setError(error.message);
      setProcessing(false);
      return;
    }

    // Save payment method and create subscription
    const response = await fetch('/api/billing/setup-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentMethodId: paymentMethod.id,
        userId: user.id,
        companyId: company.id,
      }),
    });

    const result = await response.json();

    if (result.error) {
      setError(result.error);
    } else {
      onSuccess();
    }

    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CardElement />
      {error && <div className="text-red-500">{error}</div>}
      <Button type="submit" disabled={!stripe || processing}>
        {processing ? 'Processing...' : 'Add Payment Method & Subscribe'}
      </Button>
    </form>
  );
}