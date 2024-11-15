import React, { useEffect, useState, useContext } from "react";
import { CartContext } from "../context/CartContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Loader from "./Loader/Loader";
const OrdersPage = () => {
  const { inputValue } = useContext(CartContext);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  const handleGetRequest = async () => {
    try {
      const authToken = localStorage.getItem("authToken");
      const response = await axios.get(
        `https://www.tst.annapoornamithai.com/customers/orders?mobile=${inputValue}`,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      setOrders(response.data.result);
      console.log(response.data.result);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    handleGetRequest(); // Initial fetch

    const intervalId = setInterval(() => {
      handleGetRequest(); // Fetch orders every 30 seconds
    }, 30000);

    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, [inputValue]);

  const handleCancelOrder = async (order_id) => {
    try {
      console.log(order_id);
      const response = await axios.patch(
        "https://www.tst.annapoornamithai.com/customers/orders",
        {
          order_id: order_id,
        }
      );
      alert("Refund initiated");
    } catch (err) {
      console.log(err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  useEffect(() => {
    handleGetRequest();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    handleGetRequest();

    return () => clearTimeout(timer);
  }, []);

  const OrderCard = ({ order, isOngoing }) => (
    <div className="bg-white rounded-lg p-4 mb-4 font-Nunito md:mx-10 border border-[#E6E6E6]">
      <div className="flex flex-col md:flex-row justify-between items-start gap-2 md:items-center mb-2 ">
        <div>
          <p className="font-bold text-[12px]">ORDER ID: {order.order_id}</p>
          <p className="text-[#909090] text-[10px]">
            Ordered on {new Date(order.received_date).toLocaleString()}
          </p>
        </div>
        {order.preorder_date == null ? (
          <></>
        ) : (
          <span
            className={`px-2 py-1 rounded-md text-[10px] font-extrabold bg-purple-100 border border-[#ff44ec] text-[#ff44ec]`}
          >
            Pre-order:{formatDate(order.preorder_date)}
          </span>
        )}
        <span
          className={`px-2 py-1 rounded-md text-[10px] font-extrabold ${
            order.order_status === "delivered"
              ? "bg-green-100 border border-[#26A460] text-[#26A460]"
              : order.order_status === "processing"
              ? "bg-orange-100 border border-[#FAAF40] text-[#FAAF40]"
              : order.order_status === "received"
              ? "bg-blue-100 border border-[#377bcf] text-[#3257d2]"
              : "bg-yellow-100 border border-[#FFD700] text-[#FFD700]"
          }`}
        >
          {order.order_status.toUpperCase()}
        </span>
      </div>
      <div className="mb-[24px]">
        <p className="text-xs text-[#909090] mb-1">DELIVERY ADDRESS</p>
        <p className="text-xs text-[#1E1E1E]">
          {order.address || "Address not available"}
        </p>
      </div>

      {Array.isArray(order.order_items) && order.order_items.length > 0 ? (
        order.order_items.map((item, index) => (
          <div
            key={index}
            className="flex justify-between items-center my-[10px]"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-200 rounded-md mr-2">
                <img
                  src={Array.isArray(item.image) ? item.image[0] : item.image}
                  className="w-12 h-12 rounded-md"
                  alt={item.name}
                />
              </div>
              <div>
                <p className="text-sm font-semibold">
                  {item.name || "Product name"}
                </p>
                <p className="text-xs text-gray-500">₹{item.price || "0"}</p>
                {/* Removed offer price as it's not in the provided data structure */}
              </div>
            </div>
            <p className="text-xs">QTY: {item.quantity || "1"}</p>
          </div>
        ))
      ) : (
        <p className="text-sm text-gray-500">No items in this order</p>
      )}

      <div className="mt-2 bg-gray-50 p-2 rounded">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-semibold">
            {isOngoing ? "FINAL AMOUNT" : "TOTAL ORDER AMOUNT"}
          </span>
          <span className="text-sm font-semibold">
            ₹{order.total_price || "0"}
          </span>
        </div>
        {/* Removed savings information as it's not provided in the data */}
        <p className="text-xs text-gray-600 mb-1">
          Payment Status: {order.payment_status}
        </p>
      </div>
      <div>
        {/* {order.customer_cancellation ? (
          <button
            className="bg-red-400 mt-2 w-full p-2 rounded"
            onClick={() => {
              handleCancelOrder(order.order_id);
            }}
          >
            Cancel Order
          </button>
        ) : (
          <div className="mt-2">No cancellation available</div>
        )} */}

        {order.customer_cancellation ? (
          <button
            className="bg-red-400 mt-2 w-full p-2 rounded"
            onClick={() => {
              handleCancelOrder(order.order_id);
            }}
          >
            Cancel Order
          </button>
        ) : order.order_status === "cancelled" ? (
          <div className="mt-2">Order Cancelled </div>
        ) : (
          <div className="mt-2">No cancellation available</div>
        )}
      </div>
    </div>
  );
  if (isLoading) {
    return <Loader />;
  }

  if (orders.length === 0) {
    return (
      <div className="p-10 border-2 border-[#E6E6E6] rounded-lg md:m-10 font-Nunito">
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold mb-4">
            You haven't purchased anything from us yet
          </h2>
          <p className="text-gray-600 mb-4">
            Start shopping to see your orders here!
          </p>
          <button
            className="px-4 py-2 rounded-lg bg-[#d7c59e] text-[#6B4B34]"
            onClick={() => {
              navigate("/shop");
            }}
          >
            SHOP NOW
          </button>
        </div>
      </div>
    );
  }

  const ongoingOrders = orders.filter(
    (order) => order.order_status !== "delivered" && order.order_status !== "cancelled"
  );
  // const completedOrders = orders.filter(
  //   (order) => order.order_status === "delivered"
  // );
  const completedOrders = orders.filter(
    (order) => order.order_status === "delivered" || order.order_status === "cancelled"
  );

  return (
    <div className="p-10 border-2 border-[#E6E6E6] rounded-lg md:m-10 font-Nunito">
      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4">
        <div className="order-2 lg:order-none">
          <h1 className="font-bold mb-4 md:ml-10 text-[16px] text-[#1E1E1E]">
            Order History
          </h1>
          {completedOrders.map((order) => (
            <OrderCard key={order.order_id} order={order} isOngoing={false} />
          ))}
          {completedOrders.length === 0 && (
            <p className="text-center text-gray-500 md:ml-10">
              No completed orders yet.
            </p>
          )}
        </div>
        <div className="order-1 lg:order-none">
          <h1 className="text-[#1E1E1E] text-[16px] font-bold mb-4 md:ml-10">
            Ongoing orders{" "}
            <span className="bg-red-500 text-white items-center rounded-full px-2 py-1 text-xs">
              {ongoingOrders.length}
            </span>
          </h1>
          {ongoingOrders.map((order) => (
            <OrderCard key={order.order_id} order={order} isOngoing={true} />
          ))}
          {ongoingOrders.length === 0 && (
            <p className="text-center text-gray-500 md:ml-10">
              No ongoing orders.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
