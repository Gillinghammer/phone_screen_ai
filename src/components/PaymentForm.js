import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const PaymentForm = ({ user, company }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: elements.getElement(CardElement),
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      const response = await fetch("/api/billing/save-payment-method", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          companyId: company.id,
          userId: user.id,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        // Handle successful subscription creation
        console.log("Subscription created:", result.subscriptionId);
      } else {
        setError(result.error.message);
      }

      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="card-element">Credit Card</Label>
            <CardElement
              id="card-element"
              className="mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button
            type="submit"
            disabled={!stripe || loading}
            className="w-full"
          >
            {loading ? "Processing..." : "Save Payment Method and Subscribe"}
          </Button>
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default PaymentForm;
