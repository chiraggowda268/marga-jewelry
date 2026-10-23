/**
 * Razorpay Payment Gateway Integration for Marga Jewelry
 * Supports all UPI Apps (GPay, PhonePe, Paytm, BHIM), Credit/Debit Cards, NetBanking & EMI.
 */

declare global {
  interface Window {
    Razorpay: any;
  }
}

export type RazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
};

/**
 * Loads the official Razorpay Checkout script dynamically
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error("Failed to load Razorpay SDK");
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Retrieves the configured Razorpay Key ID
 */
export function getRazorpayKeyId(): string {
  // Check from environment variables (.env)
  const envKey = (import.meta.env as Record<string, string | undefined>)["VITE_RAZORPAY_KEY_ID"];
  if (envKey && envKey.trim()) {
    return envKey.trim();
  }

  // Check from localStorage (if configured via Admin Settings)
  if (typeof window !== "undefined") {
    const customKey = localStorage.getItem("marga_razorpay_key_id");
    if (customKey && customKey.trim()) {
      return customKey.trim();
    }
  }

  // Fallback to configured key
  return "rzp_test_SPnZED73FNEVZM";
}

export type OpenRazorpayOptions = {
  amountInINR: number;
  orderReference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onSuccess: (response: RazorpaySuccessResponse) => void;
  onDismiss?: () => void;
  onError?: (err: any) => void;
};

/**
 * Launches the official Razorpay modal
 */
export async function openRazorpayCheckout({
  amountInINR,
  orderReference,
  customerName,
  customerEmail,
  customerPhone,
  onSuccess,
  onDismiss,
  onError,
}: OpenRazorpayOptions) {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    alert("Unable to load Razorpay payment gateway. Please check your internet connection.");
    onError?.(new Error("Razorpay SDK failed to load"));
    return;
  }

  const key = getRazorpayKeyId();

  // Production Check: Key ID must be present
  if (!key) {
    alert("Payment gateway is temporarily unavailable. Please try an alternative payment method or contact support.");
    onError?.(new Error("Razorpay Key ID not configured"));
    return;
  }

  // Official Razorpay Checkout Options
  const options = {
    key: key,
    amount: Math.round(amountInINR * 100), // Amount in paise (e.g. ₹2,499 -> 249900)
    currency: "INR",
    name: "Marga Jewelry",
    description: `Fine Jewelry Order #${orderReference}`,
    image: "/favicon.png",
    handler: function (response: RazorpaySuccessResponse) {
      onSuccess(response);
    },
    prefill: {
      name: customerName,
      email: customerEmail,
      contact: customerPhone,
    },
    notes: {
      order_id: orderReference,
      brand: "Marga Jewelry",
    },
    theme: {
      color: "#0F3D4E", // Petrol Brand Color
    },
    modal: {
      ondismiss: function () {
        onDismiss?.();
      },
    },
  };

  try {
    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", function (resp: any) {
      console.error("Razorpay Payment Failed:", resp.error);
      alert(`Payment Failed: ${resp.error.description || "Transaction was declined"}`);
      onError?.(resp.error);
    });
    rzp.open();
  } catch (error) {
    console.error("Error opening Razorpay modal:", error);
    onError?.(error);
  }
}
