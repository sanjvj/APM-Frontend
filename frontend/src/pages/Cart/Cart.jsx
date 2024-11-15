import React, { useState, useEffect, useContext, createContext } from "react";
import Navbar from "../../components/Navbar/Navbar";
import Slider from "../../components/Slider/Slider";
import ShopHero from "../../components/ShopHero";
import Footer from "../../components/Footer";
import Login from "../../components/Login";
import FooterBar from "../../components/FooterBar";
import OTPVerification from "../../components/OTPVerification";
import axios from "axios";
import { CartContext } from "../../context/CartContext";
import Loader from "../../components/Loader/Loader";
import { useNavigate } from "react-router-dom";
import OrderPlacedModal from "../../components/OrderPlaced";
import CartHeader from "../../components/CartHeader";
import AddressForm from "../../components/AddressForm";
import VerificationSuccess from "../../components/VerificationSuccess";
import SignupForm from "../../components/Signup";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import Swal from "sweetalert2";
import Slider2 from "../../components/Slider2";
const CartPage = () => {
  const [deliveryAmount, setDelivery] = useState(100);
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    inputValue,
    setInputValue,
    formData,
    loggedin,
    setLoggedIn,
  } = useContext(CartContext);

  useEffect(() => {
    console.log(cartItems);
    let gramWeight = 0;
    let kiloWeight = 0;
    cartItems.forEach((item) => {
      if (item.weight.includes("KG")) {
        kiloWeight += item.quantity * 1000;
      } else {
        const weight = item.weight;
        let numberOnly = weight.replace(/[^\d.]/g, "");
        let gmQuantity = parseFloat(numberOnly);
        gramWeight += item.quantity * gmQuantity;
      }
    });
    const totalWeight = gramWeight + kiloWeight;
    console.log("gram quantity = " + gramWeight);
    console.log("Kilo quantity = " + kiloWeight);
    console.log("total quantity = " + totalWeight);
    const weightPercent = Math.ceil(totalWeight / 1000);
    console.log("total weight percent = " + weightPercent);
    setDelivery(weightPercent * 100);
  }, [cartItems]);

  const [isLoading, setIsLoading] = useState(false);
  const [buttonPressed, setButtonPressed] = useState(false);
  const [hasVerified, setHasVerified] = useState(false);
  const [showOrderPlaced, setShowOrderPlaced] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showError, setShowError] = useState(false);
  const navigate = useNavigate();
  const [isPreOrder, setIsPreOrder] = useState(false);
  const [preOrderDate, setPreOrderDate] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [alert, setAlert] = useState(false);

  const [showSignup, setShowSignup] = useState(false);
  const handleSignup = () => {
    setShowLogin(false);
    setShowSignup(true);
  };
  const handleSendOtp = () => {
    setShowLogin(true);
    console.log(cartItems);
  };

  const handleMobileNumber = async (isResend = false) => {
    // if (!isResend && inputValue.length !== 10) {
    //   setShowError(true);
    //   return;
    // }

    if (isResend) {
      setShowLogin(false);
      setShowOTPVerification(true);
    }

    try {
      console.log("Sending OTP to:", inputValue);
      const response = await axios.post(
        "https://www.tst.annapoornamithai.com/customers/send-otp",
        { mobile: inputValue },

        { withCredentials: true }
      );
      console.log("OTP send response:", response.data);
      // Handle successful OTP send (e.g., show a success message)
    } catch (error) {
      console.error("Error sending OTP:", error);
      if (error.response) {
        console.error("Server responded with:", error.response.data);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error setting up request:", error.message);
      }
      if (isResend) {
        setShowOTPVerification(false);
        setShowLogin(true);
        setShowError(true);
      }
    }
  };

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      setLoggedIn(true);
    } else {
      setLoggedIn(false);
    }
  }, []);

  const handleAddressForm = () => {
    setShowAddressForm(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  /* const handleAddressForm = () => {
    infoAlert().then((result) => {
      if (result.isConfirmed) {
        setShowAddressForm(true);
      }
    });
  }; */

  const handlePlaceOrder = async () => {
    try {
      setButtonPressed(true);
      // setShowAddressForm(true);
      console.log(selectedDate);
      console.log(document.cookie); // This might not show HttpOnly cookies
      console.log(cartItems);
      // Step 1: Create an order in your backend to get an order ID
      const authToken = localStorage.getItem("authToken");
      const address =
        formData.addressLine1 +
        ", " +
        formData.addressLine2 +
        " \n" +
        formData.city +
        ", " +
        formData.pincode +
        "\n" +
        formData.state;
      // Make sure authToken exists
      console.log(address);
      if (!authToken) {
        throw new Error("No authentication token found. Please log in.");
      }
      const cart = localStorage.getItem("cart");
      console.log(preOrderDate);
      const response = await axios.post(
        "https://www.tst.annapoornamithai.com/customers/orders",
        {
          totalPrice: total.toFixed(2),
          currency: "INR",
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
          user_mobile: inputValue,
          address: address,
          role: "customer",
          orderItems: cartItems,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!response.status) {
        setButtonPressed(false);
      }
      const order = response.data;
      console.log(order);

      // Step 2: Initiate the Razorpay payment
      const options = {
        // key: process.env.REACT_APP_RAZOR_LIVE_KEY,
        key: "rzp_test_ZyVKG8K6k1Gol1", // FOR TEST
        amount: order.amount,
        currency: "INR",
        name: "Annapoorna Mithai",
        description: "Order Payment",
        order_id: order.id,
        handler: async (response) => {
          try {
            console.log(formData);

            console.log(subtotal);
            console.log(gst);
            console.log(delivery);
            setIsLoading(true);
            const paymentResponse = await axios.post(
              "https://www.tst.annapoornamithai.com/customers/verify-order",
              {
                orderId: order.id,
                paymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
                orderItems: cartItems,
                totalAmount: subtotal.toFixed(2),
                gst: gst.toFixed(2),
                sweetGST: sweetsGST,
                savoriesGST: savouriesGST,
                delivery: delivery,
                email: formData.email,
                userName: formData.name,
                address: address,
                mobile: formData.mobile,
                user_mobile: inputValue,
                preorderDate: selectedDate,
                state: formData.state,
              },
              {
                withCredentials: true,
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${authToken}`, // Use authToken here, not token
                },
              }
            );

            const result = paymentResponse.data;
            if (result.status) {
              setShowOrderPlaced(true);
              clearCart();

              // Redirect to order confirmation page or show a success message
            } else {
              alert(
                "Payment successful but failed to update order. Please contact support."
              );
            }
          } catch (error) {
            console.error("Error verifying payment:", error);
            alert("Error verifying payment. Please contact support.");
          } finally {
            setIsLoading(false); // Stop loading regardless of outcome
            setButtonPressed(false);
            setLoggedIn(false);
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email, // Fixed typo in email
          contact: formData.mobile, // Changed to string for consistency
        },
        theme: {
          color: "#3399cc",
        },
        modal: {
          ondismiss: function () {
            setButtonPressed(false);
            console.log("Razorpay payment modal closed");
          },
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error("Error creating order:", error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error data:", error.response.data);
        console.error("Error status:", error.response.status);
        console.error("Error headers:", error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Error request:", error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error message:", error.message);
      }
      alert("Failed to create order. Please try again.");
    }
  };
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isVerified, setIsVerified] = useState(false);

  const handleVerificationSuccess = () => {
    setIsVerified(true);
  };

  const updateCartItemCount = () => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    const count = storedCart.reduce((total, item) => total + item.quantity, 0);
    setCartItemCount(count);
  };

  useEffect(() => {
    updateCartItemCount();
    window.addEventListener("storage", updateCartItemCount);

    return () => {
      window.removeEventListener("storage", updateCartItemCount);
    };
  }, []);

  const [showLogin, setShowLogin] = useState(false);

  const handleQuantityChange = (index, change) => {
    updateQuantity(index, change);
  };

  const handleDeleteItem = (index) => {
    removeFromCart(index);
  };

  const triggerCartUpdate = () => {
    const event = new Event("storage");
    window.dispatchEvent(event);
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 7);
  const minDateString = minDate.toISOString().split("T")[0];

  const handlePreOrderChange = (e) => {
    setIsPreOrder(e.target.checked);
  };

  const handlePreOrderDateChange = (e) => {
    setPreOrderDate(e.target.value);
  };

  const calculateSubtotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const calculateGST = () => {
    let sweetsGST = 0;
    let savouriesGST = 0;

    cartItems.forEach((item) => {
      if (item.category === "Sweets") {
        sweetsGST += item.price * item.quantity * 0.05;
      } else if (item.category === "Savouries") {
        savouriesGST += item.price * item.quantity * 0.12;
      }
    });

    const totalGST = sweetsGST + savouriesGST;

    return { sweetsGST, savouriesGST, totalGST };
  };

  const { sweetsGST, savouriesGST, totalGST } = calculateGST();

  const calculateItemSavings = (item) => {
    return Math.round((item.mrp - item.price) * item.quantity * 100) / 100;
  };

  const calculateTotalSavings = () => {
    return (
      Math.round(
        cartItems.reduce(
          (total, item) => total + calculateItemSavings(item) * 100,
          0
        )
      ) / 100
    );
  };
  const calculateFinalAmount = () => {
    const subtotal = calculateSubtotal();
    const gst = totalGST;
    // const gst = 0;
    return {
      total: subtotal + gst + deliveryAmount,
      gst,
      delivery: deliveryAmount,
      subtotal,
    };
  };

  const { total, gst, delivery, subtotal } = calculateFinalAmount();

  const meetsMinimumOrder = () => {
    return total >= 599;
  };

  const currentYear = new Date().getFullYear();
  const excludedDates = [
    new Date(currentYear, 9, 30), // Month is 0-indexed, so 9 is October
    new Date(currentYear, 9, 31),
  ];

  return (
    <div>
      <Navbar cartItemCount={cartItemCount} />
      <Slider />
      <CartHeader></CartHeader>
      {isLoading && <Loader />}
      {showOrderPlaced && <OrderPlacedModal />}
      <div className="p-10 lg:border-2 rounded-lg lg:m-10">
        {cartItems.length > 0 ? (
          <div className="lg:flex justify-between">
            <div className="w-full lg:w-5/12">
              <h2 className="text-[16px] font-Nunito font-extrabold mb-2">
                Your Cart
              </h2>
              <p className="text-[12px] font-Nunito text-[#909090] mb-4">
                Cart is looking good with these items!
              </p>
              <div className="w-full bg-[#F8F8F8] rounded-lg">
                <div className="flex justify-between px-3 pt-3 mb">
                  <p className="font-Nunito font-bold text-[14px] flex">
                    <span>
                      <img
                        src="delivery.svg"
                        className="w-[16px] h-[16px]"
                      ></img>
                    </span>
                    Delivery
                  </p>
                  {/* <p className="font-Nunito font-bold text-[10px] text-[#909090] cursor-pointer">
                    CHANGE
                  </p> */}
                </div>
                <div>
                  <h1 className="font-Nunito font-semibold text-[12px] px-3 pt-1 text-[#909090]">
                    {formData.addressLine1}, {formData.addressLine2}
                  </h1>
                  <h1 className="font-Nunito font-semibold text-[12px] px-3 pb-3 text-[#909090]">
                    {formData.city}-{formData.pincode}
                  </h1>
                </div>
              </div>
              {cartItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between my-4 py-4"
                >
                  <div className="flex items-center justify-center">
                    <img
                      src={item.image[0] || item.image}
                      alt={item.name}
                      className="w-[56px] h-[56px] md:w-[56px] md:h-[56px] lg:w-[64px] lg:h-[64px] mr-4 rounded"
                    />
                    <div>
                      <h3 className="text-[14px] lg:text-[16px] font-bold">
                        {item.name}
                      </h3>
                      <p className="text-[12px] lg:text-[12px] font-bold text-[#909090]">
                        ₹{item.price} per {item.weight}
                      </p>
                      <p className="text-[12px] lg:text-[12px] font-bold text-[#26A460]">
                        You save ₹{calculateItemSavings(item).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-[#F8F8F8] w-[83px] items-center flex justify-center rounded-lg">
                      <button
                        onClick={() => handleQuantityChange(index, -1)}
                        className="font-Nunito font-extrabold px-3 py-1 rounded"
                      >
                        -
                      </button>
                      <span className="mx-2 font-semibold font-Nunito">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(index, 1)}
                        className="px-3 py-1 rounded font-extrabold font-Nunito"
                      >
                        +
                      </button>
                    </div>
                    <img
                      src="delete.svg"
                      onClick={() => handleDeleteItem(index)}
                      className="cursor-pointer px-2 py-1 ml-2"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="border border-[#70513A30] h-auto mb-6 lg:mb-0"></div>
            <div className="w-full lg:w-6/12">
              <h3 className="text-[16px] font-extrabold font-Nunito mb-4">
                Cart Summary
              </h3>
              <div className="bg-[#F8F8F8] w-full lg:w-10/12 p-6 rounded-lg">
                <div className="flex justify-between my-2">
                  <p className="text-[#909090] text-[12px] font-semibold font-Nunito">
                    TOTAL AMOUNT
                  </p>
                  <p className="font-bold font-Nunito text-[#606060] text-[14px]">
                    ₹{subtotal.toFixed(2)}
                  </p>
                </div>
                <div className="flex justify-between mb-2">
                  <p className="text-[#909090] text-[12px] font-semibold font-Nunito">
                    GST{" "}
                  </p>
                  <p className="font-bold font-Nunito text-[#606060] text-[14px]">
                    ₹{gst.toFixed(2)}
                  </p>
                </div>
                {/* <div className='flex justify-between mb-2'>
                  <p className='text-[#909090] text-[12px] font-semibold font-Nunito'>SPECIAL OFFER </p>
                  <p className='font-bold font-Nunito text-[#606060] text-[14px]'>-₹{specialOffer}</p>
                </div>  */}
                <div className="flex justify-between mb-4">
                  <p className="text-[#909090] text-[12px] font-semibold font-Nunito">
                    DELIVERY FEE{" "}
                  </p>
                  <p className="font-bold font-Nunito text-[#606060] text-[14px]">
                    ₹{delivery}
                  </p>
                </div>
                <div className="flex justify-between mb-3">
                  <h4 className="text-[14px] font-extrabold font-Nunito">
                    FINAL AMOUNT TO PAY
                  </h4>
                  <p className="text-[18px] font-extrabold font-Nunito">
                    ₹{total.toFixed(2)}
                  </p>
                </div>
                <div className="flex gap-1 mt-3">
                  <img src="saving.svg"></img>
                  <p className="text-[#26A460] text-[14px] font-bold font-Nunito">
                    You saved ₹{calculateTotalSavings().toFixed(2)} in this
                    order!
                  </p>
                </div>
                <div className="mt-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isPreOrder}
                      onChange={handlePreOrderChange}
                      className="mr-2"
                    />
                    <span className="text-[14px] font-semibold">
                      Do you want to pre-order your sweets?
                    </span>
                  </label>
                </div>
                {isPreOrder && (
                  <div className="mt-2">
                    <label className="text-[14px] font-semibold block mb-1">
                      Select Pre-order Date:
                    </label>

                    <DatePicker
                      selected={selectedDate}
                      onChange={(date) => setSelectedDate(formatDate(date))}
                      excludeDates={excludedDates}
                      dateFormat="dd/MM/yyyy"
                      minDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
                      className="w-full rounded-lg bg-[#ffff] border p-4 border-[#000000] h-10"
                    />
                  </div>
                )}
              </div>
              <div className="w-full lg:w-10/12">
                {!meetsMinimumOrder() && (
                  <p className="text-red-500 text-sm mb-2">
                    Minimum order amount is ₹599. Please add more items to your
                    cart.
                  </p>
                )}
                <button
                  onClick={loggedin ? handleAddressForm : handleSendOtp}
                  className={`w-full font-bold py-3 px-4 rounded-lg ${
                    meetsMinimumOrder()
                      ? "bg-[#332D21] text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  disabled={!meetsMinimumOrder() || buttonPressed}
                >
                  {buttonPressed ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Placing...
                    </span>
                  ) : loggedin ? (
                    "Place your Order Now"
                  ) : (
                    "Login to Place your Order"
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5 justify-center items-center h-64">
            <p className="text-xl font-bold">Your cart is empty.</p>
            <button
              className="px-4 py-2 rounded-lg bg-[#d7c59e] text-[#6B4B34]"
              onClick={() => {
                navigate("/shop");
              }}
            >
              SHOP NOW
            </button>
          </div>
        )}
      </div>

      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <Login
            setShowLogin={setShowLogin}
            setShowOTPVerification={setShowOTPVerification}
            setInputValue={setInputValue}
            handleMobileNumber={handleMobileNumber}
            handleSignup={handleSignup}
          />
        </div>
      )}
      {showSignup && (
        <SignupForm
          onClose={() => setShowSignup(false)}
          handleSignup={handleSignup}
        />
      )}
      {showOTPVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <OTPVerification
            setShowOTPVerification={setShowOTPVerification}
            onVerificationSuccess={handleVerificationSuccess}
            setLoggedIn={setLoggedIn}
            hasVerified={hasVerified}
            setHasVerified={setHasVerified}
            handleMobileNumber={() => handleMobileNumber(true)}
          />
        </div>
      )}

      {hasVerified && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <VerificationSuccess
            setShowOTPVerification={setShowOTPVerification}
            setShowAddressForm={setShowAddressForm}
          ></VerificationSuccess>
        </div>
      )}

      {showAddressForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <AddressForm
            onClose={() => setShowAddressForm(false)}
            setHasVerified={setHasVerified}
            handlePlaceOrder={handlePlaceOrder}
          />
        </div>
      )}

      <ShopHero />
      <Footer />
      <FooterBar cartItemCount={cartItemCount}></FooterBar>
    </div>
  );
};

export default CartPage;
