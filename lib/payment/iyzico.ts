import Iyzipay from "iyzipay";

export type InitiateOpts = {
  conversationId: string;
  price: number;
  currency?: "TRY";
  buyer: {
    id: string;
    name: string;
    surname: string;
    email: string;
    gsmNumber: string;
    ip: string;
    city?: string;
    country?: string;
    address?: string;
    identityNumber?: string;
  };
  basketItems: Array<{
    id: string;
    name: string;
    category: string;
    price: number;
  }>;
  callbackUrl: string;
};

export type InitiateResult =
  | { ok: true; paymentPageUrl: string; token: string }
  | { ok: false; error: string };

export type VerifyResult =
  | { ok: true; status: "SUCCESS"; conversationId: string; paymentId: string; price: number }
  | { ok: true; status: "FAILURE"; conversationId: string; errorMessage?: string }
  | { ok: false; error: string };

function getClient(): Iyzipay | null {
  const apiKey = process.env.IYZICO_API_KEY;
  const secretKey = process.env.IYZICO_SECRET_KEY;
  const uri = process.env.IYZICO_BASE_URL || "https://sandbox-api.iyzipay.com";

  if (!apiKey || !secretKey) return null;
  return new Iyzipay({ apiKey, secretKey, uri });
}

export function isIyzicoConfigured(): boolean {
  return Boolean(process.env.IYZICO_API_KEY && process.env.IYZICO_SECRET_KEY);
}

export function iyzicoInitiate(opts: InitiateOpts): Promise<InitiateResult> {
  const client = getClient();
  if (!client) {
    return Promise.resolve({ ok: false, error: "Iyzico ayarlanmamis (env var eksik)" });
  }

  const totalPrice = opts.basketItems.reduce((sum, i) => sum + i.price, 0);
  const price = Number(totalPrice.toFixed(2));

  const request = {
    locale: Iyzipay.LOCALE.TR,
    conversationId: opts.conversationId,
    price: price.toFixed(2),
    paidPrice: price.toFixed(2),
    currency: opts.currency || Iyzipay.CURRENCY.TRY,
    basketId: opts.conversationId,
    paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
    callbackUrl: opts.callbackUrl,
    enabledInstallments: [1, 2, 3, 6, 9],
    buyer: {
      id: opts.buyer.id,
      name: opts.buyer.name || "Musteri",
      surname: opts.buyer.surname || "Randevu",
      gsmNumber: opts.buyer.gsmNumber || "+905555555555",
      email: opts.buyer.email || "musteri@example.com",
      identityNumber: opts.buyer.identityNumber || "11111111111",
      registrationAddress: opts.buyer.address || "Belirtilmedi",
      ip: opts.buyer.ip || "127.0.0.1",
      city: opts.buyer.city || "Istanbul",
      country: opts.buyer.country || "Turkey",
    },
    shippingAddress: {
      contactName: `${opts.buyer.name || "Musteri"} ${opts.buyer.surname || "Randevu"}`.trim(),
      city: opts.buyer.city || "Istanbul",
      country: opts.buyer.country || "Turkey",
      address: opts.buyer.address || "Online randevu",
    },
    billingAddress: {
      contactName: `${opts.buyer.name || "Musteri"} ${opts.buyer.surname || "Randevu"}`.trim(),
      city: opts.buyer.city || "Istanbul",
      country: opts.buyer.country || "Turkey",
      address: opts.buyer.address || "Online randevu",
    },
    basketItems: opts.basketItems.map((b) => ({
      id: b.id,
      name: b.name,
      category1: b.category || "Hizmet",
      itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
      price: b.price.toFixed(2),
    })),
  };

  return new Promise((resolve) => {
    client.checkoutFormInitialize.create(request as any, (err: any, result: any) => {
      if (err) {
        resolve({ ok: false, error: err.message || "Iyzico hata" });
        return;
      }
      if (result?.status !== "success") {
        resolve({ ok: false, error: result?.errorMessage || "Iyzico initialize basarisiz" });
        return;
      }
      resolve({ ok: true, paymentPageUrl: result.paymentPageUrl, token: result.token });
    });
  });
}

export function iyzicoVerify(token: string): Promise<VerifyResult> {
  const client = getClient();
  if (!client) {
    return Promise.resolve({ ok: false, error: "Iyzico ayarlanmamis" });
  }

  return new Promise((resolve) => {
    client.checkoutForm.retrieve({ locale: Iyzipay.LOCALE.TR, token, conversationId: "" } as any, (err: any, result: any) => {
      if (err) {
        resolve({ ok: false, error: err.message || "Iyzico verify hata" });
        return;
      }
      if (result?.status !== "success") {
        resolve({
          ok: true,
          status: "FAILURE",
          conversationId: result?.conversationId || "",
          errorMessage: result?.errorMessage,
        });
        return;
      }
      if (result.paymentStatus === "SUCCESS") {
        resolve({
          ok: true,
          status: "SUCCESS",
          conversationId: result.conversationId,
          paymentId: result.paymentId,
          price: Number(result.price),
        });
      } else {
        resolve({
          ok: true,
          status: "FAILURE",
          conversationId: result.conversationId || "",
          errorMessage: `paymentStatus=${result.paymentStatus}`,
        });
      }
    });
  });
}
