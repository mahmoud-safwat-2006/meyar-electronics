import * as dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import Cookies from "js-cookie";

// Internal imports
import useCartInfo from "./use-cart-info";
import { set_shipping } from "@/redux/features/order/orderSlice";
import { set_coupon } from "@/redux/features/coupon/couponSlice";
import { notifyError, notifySuccess } from "@/utils/toast";
import {
  useCreatePaymentIntentMutation,
  useSaveOrderMutation,
} from "@/redux/features/order/orderApi";
import { useGetOfferCouponsQuery } from "@/redux/features/coupon/couponApi";

const useCheckoutSubmit = () => {
  const { data: offerCoupons, isError, isLoading } = useGetOfferCouponsQuery();
  const [saveOrder] = useSaveOrderMutation();
  const [createPaymentIntent] = useCreatePaymentIntentMutation();

  const { cart_products } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const { shipping_info } = useSelector((state) => state.order);

  const { total, setTotal } = useCartInfo();
  const [couponInfo, setCouponInfo] = useState({});
  const [cartTotal, setCartTotal] = useState(0);
  const [minimumAmount, setMinimumAmount] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [discountProductType, setDiscountProductType] = useState("");
  const [isCheckoutSubmit, setIsCheckoutSubmit] = useState(false);
  const [cardError, setCardError] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [showCard, setShowCard] = useState(false);
  const [couponApplyMsg, setCouponApplyMsg] = useState("");

  const dispatch = useDispatch();
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  let couponRef = useRef("");

  // استرجاع الكوبون المحفوظ سابقاً
  useEffect(() => {
    try {
      const data = localStorage.getItem("couponInfo");
      if (data) {
        const coupon = JSON.parse(data);
        setCouponInfo(coupon);
        setDiscountPercentage(coupon.discountPercentage || 0);
        setMinimumAmount(coupon.minimumAmount || 0);
        setDiscountProductType(coupon.productType || "");
      }
    } catch (e) {
      console.error("Error reading coupon from localStorage", e);
    }
  }, []);

  // إلغاء الكوبون إذا انخفض إجمالي السلة أو فرغت
  useEffect(() => {
    if (minimumAmount > 0 && (total < minimumAmount || cart_products.length === 0)) {
      setDiscountPercentage(0);
      setDiscountAmount(0);
      localStorage.removeItem("couponInfo");
    }
  }, [minimumAmount, total, cart_products]);

  // حساب الإجمالي والخصم بدقة وبدون حلقة تكرار
  useEffect(() => {
    const applicableProducts = cart_products?.filter(
      (p) => !discountProductType || p.productType === discountProductType
    );

    const discountEligibleTotal = (applicableProducts || []).reduce(
      (acc, item) => acc + (Number(item.price) || 0) * (Number(item.orderQuantity) || 1),
      0
    );

    const calculatedDiscount = Number(
      (discountEligibleTotal * (discountPercentage / 100)).toFixed(2)
    );

    const subTotalWithShipping = Number((total + shippingCost).toFixed(2));
    const finalTotal = Math.max(0, Number((subTotalWithShipping - calculatedDiscount).toFixed(2)));

    setDiscountAmount(calculatedDiscount);
    setCartTotal(finalTotal);
  }, [total, shippingCost, discountPercentage, cart_products, discountProductType]);

  // إنشاء نية الدفع لـ Stripe عند توفر الإجمالي والمنتجات
  useEffect(() => {
    if (cartTotal > 0 && cart_products?.length > 0) {
      createPaymentIntent({
        price: cartTotal,
        cart: cart_products,
        couponCode: couponInfo?.couponCode,
        shippingCost: shippingCost,
      })
        .then((res) => {
          if (res?.data?.clientSecret) {
            setClientSecret(res.data.clientSecret);
          }
        })
        .catch((error) => {
          console.error("Error creating payment intent:", error);
        });
    }
  }, [createPaymentIntent, cartTotal, shippingCost, couponInfo?.couponCode]);

  // تطبيق كود الكوبون
  const handleCouponCode = (e) => {
    e.preventDefault();

    const code = couponRef.current?.value?.trim();
    if (!code) {
      notifyError("يرجى إدخال كود الكوبون!");
      return;
    }
    if (isLoading) return;

    if (isError) {
      notifyError("حدث خطأ أثناء فحص الكوبون");
      return;
    }

    const matchedCoupon = offerCoupons?.find(
      (coupon) => coupon.couponCode?.toUpperCase() === code.toUpperCase()
    );

    if (!matchedCoupon) {
      notifyError("كود الكوبون غير صحيح!");
      return;
    }

    if (matchedCoupon.endTime && dayjs().isAfter(dayjs(matchedCoupon.endTime))) {
      notifyError("عذراً، هذا الكوبون انتهت صلاحيته!");
      return;
    }

    if (total < (matchedCoupon.minimumAmount || 0)) {
      notifyError(
        `الحد الأدنى للطلب لتفعيل هذا الكوبون هو ${matchedCoupon.minimumAmount} $`
      );
      return;
    }

    setCouponApplyMsg(`تم تطبيق كوبون الخصم بنجاح (${matchedCoupon.discountPercentage}%)`);
    setCouponInfo(matchedCoupon);
    setMinimumAmount(matchedCoupon.minimumAmount || 0);
    setDiscountProductType(matchedCoupon.productType || "");
    setDiscountPercentage(matchedCoupon.discountPercentage || 0);
    dispatch(set_coupon(matchedCoupon));
    localStorage.setItem("couponInfo", JSON.stringify(matchedCoupon));

    setTimeout(() => {
      if (couponRef.current) couponRef.current.value = "";
      setCouponApplyMsg("");
    }, 4000);
  };

  const handleShippingCost = (value) => {
    setShippingCost(Number(value) || 0);
  };

  // ملء بيانات الشحن تلقائياً
  useEffect(() => {
    if (shipping_info) {
      setValue("firstName", shipping_info.firstName || "");
      setValue("lastName", shipping_info.lastName || "");
      setValue("country", shipping_info.country || "");
      setValue("address", shipping_info.address || "");
      setValue("city", shipping_info.city || "");
      setValue("zipCode", shipping_info.zipCode || "");
      setValue("contactNo", shipping_info.contactNo || "");
      setValue("email", shipping_info.email || user?.email || "");
      setValue("orderNote", shipping_info.orderNote || "");
    }
  }, [user, setValue, shipping_info]);

  // مسح السلة وبيانات الجلسة بعد نجاح الطلب
  const clearSessionCart = () => {
    localStorage.removeItem("cart_products");
    localStorage.removeItem("couponInfo");
    sessionStorage.removeItem("cart_products");
  };

  // إرسال وتأكيد الطلب
  const submitHandler = async (data) => {
    if (!cart_products || cart_products.length === 0) {
      notifyError("سلة المشتريات فارغة!");
      return;
    }

    dispatch(set_shipping(data));
    setIsCheckoutSubmit(true);

    const orderInfo = {
      name: `${data.firstName || ""} ${data.lastName || ""}`.trim(),
      address: data.address,
      contact: data.contactNo,
      email: data.email,
      city: data.city,
      country: data.country,
      zipCode: data.zipCode,
      shippingOption: data.shippingOption,
      status: "pending",
      cart: cart_products,
      paymentMethod: data.payment,
      subTotal: total,
      shippingCost: shippingCost,
      discount: discountAmount,
      totalAmount: cartTotal,
      orderNote: data.orderNote,
      user: user?._id || null,
    };

    // الدفع بالبطاقة عبر Stripe
    if (data.payment === "Card") {
      if (!stripe || !elements) {
        notifyError("خدمة الدفع غير جاهزة، يرجى المحاولة بعد لحظات");
        setIsCheckoutSubmit(false);
        return;
      }
      const card = elements.getElement(CardElement);
      if (!card) {
        setIsCheckoutSubmit(false);
        return;
      }

      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: card,
      });

      if (error) {
        setCardError(error.message);
        setIsCheckoutSubmit(false);
        return;
      }

      setCardError("");
      const orderData = {
        ...orderInfo,
        cardInfo: paymentMethod,
      };

      return handlePaymentWithStripe(orderData);
    }

    // الدفع عند الاستلام (COD)
    if (data.payment === "COD") {
      try {
        const res = await saveOrder(orderInfo);
        if (res?.error) {
          notifyError(res.error?.data?.message || "فشل إتمام الطلب");
          setIsCheckoutSubmit(false);
        } else {
          clearSessionCart();
          setIsCheckoutSubmit(false);
          notifySuccess("تم تأكيد طلبك بنجاح في معيار للإلكترونيات!");
          const orderId = res.data?.order?._id;
          router.push(`/order/${orderId}`);
        }
      } catch (err) {
        console.error(err);
        setIsCheckoutSubmit(false);
      }
    }
  };

  // معالجة الدفع عبر Stripe
  const handlePaymentWithStripe = async (order) => {
    try {
      if (!clientSecret) {
        notifyError("تعذر تأكيد بوابة الدفع، يرجى إعادة المحاولة.");
        setIsCheckoutSubmit(false);
        return;
      }

      const { paymentIntent, error: intentErr } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: order.name,
              email: order.email,
            },
          },
        }
      );

      if (intentErr) {
        notifyError(intentErr.message);
        setIsCheckoutSubmit(false);
        return;
      }

      const orderData = {
        ...order,
        paymentIntent,
      };

      const result = await saveOrder(orderData);
      if (result?.error) {
        notifyError(result.error?.data?.message || "فشل حفظ الطلب بعد الدفع");
        setIsCheckoutSubmit(false);
      } else {
        clearSessionCart();
        setIsCheckoutSubmit(false);
        notifySuccess("تم الدفع وتأكيد طلبك بنجاح في معيار للإلكترونيات!");
        const orderId = result.data?.order?._id;
        router.push(`/order/${orderId}`);
      }
    } catch (err) {
      console.error("Stripe payment error:", err);
      setIsCheckoutSubmit(false);
    }
  };

  return {
    handleCouponCode,
    couponRef,
    handleShippingCost,
    discountAmount,
    total,
    shippingCost,
    discountPercentage,
    discountProductType,
    isCheckoutSubmit,
    setTotal,
    register,
    errors,
    cardError,
    submitHandler,
    stripe,
    handleSubmit,
    clientSecret,
    setClientSecret,
    cartTotal,
    couponApplyMsg,
    showCard,
    setShowCard,
  };
};

export default useCheckoutSubmit;