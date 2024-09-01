import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4'
      },
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a'
    }
  },
};

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

    const result = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement),
      billing_details: {
        email: user.email,
      },
    });

    if (result.error) {
      setError(result.error.message);
      setProcessing(false);
    } else {
      const response = await fetch('/api/billing/setup-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethodId: result.paymentMethod.id,
          user: user,
          company: company,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setProcessing(false);
      } else {
        onSuccess();
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <div className="mb-4">
        <label htmlFor="card-element" className="block text-sm font-medium text-gray-700 mb-2">
          Credit or debit card
        </label>
        <div className="border border-gray-300 rounded-md p-4 bg-white shadow-sm">
          <CardElement id="card-element" options={CARD_ELEMENT_OPTIONS} />
        </div>
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <Button
        type="submit"
        disabled={!stripe || processing}
        className="w-full"
      >
        {processing ? 'Processing...' : 'Subscribe'}
      </Button>
    </form>
  );
}