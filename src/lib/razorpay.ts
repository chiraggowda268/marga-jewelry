import { createServerFn } from "@tanstack/react-start";

/**
 * Razorpay Payment Gateway Integration for Marga Jewelry
 * Supports all UPI Apps (GPay, PhonePe, Paytm, BHIM, CRED), Credit/Debit Cards, NetBanking & EMI.
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

export type CreateOrderResult = {
  success: boolean;
  orderId?: string;
  amount?: number;
  currency?: string;
  error?: string;
};

/**
 * Server-side order creation using Razorpay Orders API
 * Authenticates with Key ID and Secret securely on the server.
 */
export const createRazorpayServerOrder = createServerFn({ method: "POST" })
  .validator((data: { amountInPaise: number; receipt: string; notes?: Record<string, string> }) => data)
  .handler(async ({ data }): Promise<CreateOrderResult> => {
    try {
      const keyId =
        process.env["RAZORPAY_KEY_ID"] ||
        process.env["VITE_RAZORPAY_KEY_ID"] ||
        "rzp_live_TtMrHAG61TLoAx";
      const keySecret =
        process.env["RAZORPAY_KEY_SECRET"] ||
        "0RJnTLy80lzc7hqsvFqgQXSL";

      if (!keyId || !keySecret) {
        return { success: false, error: "Razorpay credentials not configured on server" };
      }

      const authStr = `${keyId}:${keySecret}`;
      const authHeader =
        "Basic " +
        (typeof Buffer !== "undefined"
          ? Buffer.from(authStr).toString("base64")
          : btoa(authStr));

      // Razorpay receipt has a 40 character maximum length
      const receipt = data.receipt.slice(0, 40);

      const response = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: data.amountInPaise,
          currency: "INR",
          receipt: receipt,
          notes: data.notes || {},
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: { description?: string; reason?: string } };
        console.error("Razorpay order creation failed:", errorData);
        return {
          success: false,
          error: errorData?.error?.description || `Razorpay order creation failed (${response.status})`,
        };
      }

      const orderData = (await response.json()) as { id: string; amount: number; currency: string };
      return {
        success: true,
        orderId: orderData.id,
        amount: orderData.amount,
        currency: orderData.currency,
      };
    } catch (err: any) {
      console.error("Error calling Razorpay Orders API:", err);
      return {
        success: false,
        error: err?.message || "Failed to contact Razorpay server",
      };
    }
  });

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
 * Default Live Razorpay Key ID
 */
export const DEFAULT_RAZORPAY_LIVE_KEY_ID = "rzp_live_TtMrHAG61TLoAx";

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
    // If a legacy test key was previously cached in the browser, ignore it and upgrade to live
    if (customKey && customKey.trim() && customKey !== "rzp_test_SPnZED73FNEVZM") {
      return customKey.trim();
    }
  }

  // Fallback to official Live Key ID
  return DEFAULT_RAZORPAY_LIVE_KEY_ID;
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

  const amountInPaise = Math.round(amountInINR * 100);

  // Attempt to create official Razorpay Order ID on the server (live mode best practice)
  let officialOrderId: string | undefined = undefined;
  try {
    const serverResult = await createRazorpayServerOrder({
      data: {
        amountInPaise,
        receipt: orderReference,
        notes: {
          order_id: orderReference,
          customer_name: customerName,
          customer_phone: customerPhone,
          brand: "Marga Jewelry",
        },
      },
    });

    if (serverResult && serverResult.success && serverResult.orderId) {
      officialOrderId = serverResult.orderId;
    } else if (serverResult && serverResult.error) {
      console.warn("Razorpay server order creation notice:", serverResult.error);
    }
  } catch (err) {
    console.warn("Could not create server order, continuing with direct client checkout:", err);
  }

  // Official Razorpay Checkout Options
  const options: Record<string, any> = {
    key: key,
    amount: amountInPaise, // Amount in paise (e.g. ₹2,499 -> 249900)
    currency: "INR",
    name: "Marga Jewelry",
    description: `Fine Jewelry Order #${orderReference}`,
    image: "/favicon.png",
    handler: function (response: RazorpaySuccessResponse) {
      // In case Razorpay doesn't attach razorpay_order_id in direct mode, preserve our generated orderId
      if (!response.razorpay_order_id && officialOrderId) {
        response.razorpay_order_id = officialOrderId;
      }
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

  // If official order was created on Razorpay servers, attach it
  if (officialOrderId) {
    options["order_id"] = officialOrderId;
  }

  try {
    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", function (resp: any) {
      console.error("Razorpay Payment Failed:", resp.error);
      alert(`Payment Failed: ${resp.error?.description || "Transaction was declined"}`);
      onError?.(resp.error);
    });
    rzp.open();
  } catch (error) {
    console.error("Error opening Razorpay modal:", error);
    onError?.(error);
  }
}
