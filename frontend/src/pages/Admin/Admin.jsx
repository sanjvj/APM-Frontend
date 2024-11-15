import React, { useState, useEffect } from "react";
import axios from "axios";
import Loader from "../../components/Loader/Loader";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [consignmentNumber, setConsignmentNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [orderCancelled, setOrderCancelled] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDailyReportTable, setShowDailyReportTable] = useState(false);

  useEffect(() => {
    if (
      (activeTab !== "dashboard" && activeTab !== "dailyreports") ||
      orderCancelled
    ) {
      fetchOrders(activeTab);
      setOrderCancelled(false);
    }
    if (activeTab !== "dailyreports") {
      setShowDailyReportTable(false);
    }
  }, [activeTab, orderCancelled]);

  const fetchOrders = async (status) => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        "https://www.tst.annapoornamithai.com/admin/manage-orders",
        {
          deliveryStatus: status,
        }
      );
      setOrders(
        Array.isArray(response.data.result) ? response.data.result : []
      );
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDailyReports = async () => {
    setIsLoading(true);
    console.log(selectedDate);
    try {
      const response = await axios.post(
        "https://www.tst.annapoornamithai.com/feature/view-report",
        {
          inputdate: selectedDate,
        }
      );
      setOrders(
        Array.isArray(response.data.result) ? response.data.result : []
      );
      setShowDailyReportTable(true);
    } catch (error) {
      console.error("Error fetching daily reports:", error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    setIsLoading(true);
    console.log("Selected Date :" + selectedDate);
    try {
      const response = await axios.post(
        "https://www.tst.annapoornamithai.com/feature/download-report",
        {
          inputdate: selectedDate,
        }
      );

      // if (!response.ok) {
      //   throw new Error("Network response was not ok");
      // }

      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "report.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      alert("Report downloaded successfully.");
    } catch (error) {
      console.error("Error downloading report:", error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const changeStatus = async (orderId, newStatus) => {
    
    if (newStatus === "shipped") {
      // Show modal for consignment number and tracking URL input
      setSelectedOrderId(orderId);
      setShowModal(true);
    } else {
      setIsLoading(true);
      try {
        await axios.patch(
          "https://www.tst.annapoornamithai.com/admin/manage-orders",
          {
            order_id: orderId,
            delivery_status: newStatus,
          }
        );
        await fetchOrders(activeTab);
      } catch (error) {
        console.error("Error changing order status:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleFormSubmit = async () => {
    try {
      setIsLoading(true);
      await axios.patch(
        "https://www.tst.annapoornamithai.com/admin/manage-orders",
        {
          order_id: selectedOrderId,
          delivery_status: "shipped",
          consignment_number: consignmentNumber,
          tracking_url: trackingUrl,
        }
      );
      // Close modal and reset fields
      setShowModal(false);
      setConsignmentNumber("");
      setTrackingUrl("");
      
      // Ensure that you wait for fetchOrders to complete
      await fetchOrders(activeTab); // Add 'await' here
    } catch (error) {
      console.error("Error updating shipment details:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleCancelOrder = async (order_id) => {
    try {
      const response = await axios.patch(
        "https://www.tst.annapoornamithai.com/admin/cancel-order",
        {
          order_id: order_id,
        }
      );
      alert("Order Cancelled");
      setOrderCancelled(true); // Set the flag to trigger useEffect
    } catch (err) {
      console.log(err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };

    return date.toLocaleString("en-US", options);
  };

  const Table = () => {};

  // In your component:

  const OrderCard = ({ order }) => (
    <div className="flex flex-col lg:flex-row justify-between bg-white shadow-md rounded-lg p-4 mb-4 w-full">
      <div className="lg:w-3/4">
        <h3 className="font-bold">Order ID: {order.order_id} </h3>
        <h3 className="font-bold">
          {order.preorder_date == null ? (
            <> </>
          ) : (
            <p className="text-green-400">{formatDate(order.preorder_date)}</p>
          )}
        </h3>
        <p>Customer: {order.name}</p>
        <p>Mobile: {order.mobile}</p>
        <p>Address: {order.address}</p>
        <p>Total: ₹{order.total_price}</p>
        <p>Payment: {order.payment_status}</p>
        {/* <p>
        
          {activeTab.toUpperCase()} DATE:{" "}
          {order[`${activeTab}_date`]
            ? formatDate(order[`${activeTab}_date`])
            : "N/A"}
        </p> */}

        {order.received_date && (
          <p>Received Date: {formatDate(order.received_date)}</p>
        )}
        {order.processing_date && (
          <p>Processing Date: {formatDate(order.processing_date)}</p>
        )}
        {order.shipped_date && (
          <p>Shipped Date: {formatDate(order.shipped_date)}</p>
        )}
        {order.delivered_date && (
          <p>Delivered Date: {formatDate(order.delivered_date)}</p>
        )}
        {order.cancelled_date && (
          <p>Cancelled Date: {formatDate(order.cancelled_date)}</p>
        )}
        {order.tracking_url && (
          <h4 className="font-bold mt-4">Tracking URL : {order.tracking_url}</h4>
        )}
        {order.consignment_number && (
          <h4 className="font-bold">Consignment Number : {order.consignment_number}</h4>
        )}
        

        <div className="mt-4">
          <h4 className="font-semibold">Order Items:</h4>
          {order.order_items && order.order_items.length > 0 ? (
            <ul className="list-disc pl-5">
              {order.order_items.map((item, index) => (
                <li key={index}>
                  {item.name} - {item.weight || "N/A"} - Qty:{" "}
                  {item.quantity || 1}
                </li>
              ))}
            </ul>
          ) : (
            <p>No items</p>
          )}
        </div>
        {activeTab != "cancelled" ? (
          <button
            className="w-full md:w-1/2 bg-red-500 text-white mt-2 rounded-lg px-4 py-2"
            onClick={() => {
              handleCancelOrder(order.order_id);
            }}
          >
            Cancel
          </button>
        ) : (
          <></>
        )}
      </div>
      <div className="mt-4 lg:mt-0 lg:w-1/4 bg-red">
        {activeTab != "cancelled" ? (
          <>
            {" "}
            <select
              value={activeTab} // Use activeTab as the value
              onChange={(e) => changeStatus(order.order_id, e.target.value)}
              className={`border rounded p-2 w-full lg:w-[120px] status-${activeTab}`}
            >
              <option value="received">Received</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
          </>
        ) : (
          <></>
        )}
      </div>
    </div>
  );

  const DailyReportsDatePicker = () => (
    <div className="mb-4">
      {/* <DatePicker
        selected={selectedDate}
        onChange={(date) => setSelectedDate(date)}
        className="p-2 border rounded"
      /> */}
      <input
        type="date"
        className="date-picker p-2 rounded-md shadow-lg"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
      ></input>
      <button
        onClick={fetchDailyReports}
        className="ml-2 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Submit
      </button>
    </div>
  );

  const DailyReportsTable = ({ orders }) => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
            <th className="py-3 px-6 text-left">Order ID</th>
            <th className="py-3 px-6 text-left">Name</th>
            <th className="py-3 px-6 text-left">Address</th>
            <th className="py-3 px-6 text-left">Received Date</th>
            <th className="py-3 px-6 text-left">Processing Date</th>
            <th className="py-3 px-6 text-left">Shipped Date</th>
            <th className="py-3 px-6 text-left">Delivered Date</th>
            <th className="py-3 px-6 text-left">Order Status</th>
          </tr>
        </thead>
        <tbody className="text-gray-600 text-sm font-light">
          {orders.map((order) => (
            <tr
              key={order.order_id}
              className="border-b border-gray-200 hover:bg-gray-100"
            >
              <td className="py-3 px-6 text-left whitespace-nowrap">
                {order.order_id}
              </td>
              <td className="py-3 px-6 text-left">{order.name}</td>
              <td className="py-3 px-6 text-left">{order.address}</td>
              <td className="py-3 px-6 text-left">
                {formatDate(order.received_date)}
              </td>
              <td className="py-3 px-6 text-left">
                {formatDate(order.processing_date)}
              </td>
              <td className="py-3 px-6 text-left">
                {formatDate(order.shipped_date)}
              </td>
              <td className="py-3 px-6 text-left">
                {formatDate(order.delivered_date)}
              </td>
              <td className="py-3 px-6 text-left">{order.order_status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={handleDownloadReport}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        disabled={isLoading}
      >
        {isLoading ? "Downloading..." : "Download Report"}
      </button>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100">
      {/* Hamburger menu for mobile */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Sidebar */}

      <div
        className={`fixed inset-y-0 left-0 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:relative lg:translate-x-0 transition duration-200 ease-in-out lg:block w-64 bg-white shadow-md z-40`}
      >
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4 mt-8 lg:mt-0">
            Admin Dashboard
          </h2>
          <ul>
            {[
              "dashboard",
              "received",
              "processing",
              "shipped",
              "delivered",
              "cancelled",
              "dailyreports",
            ].map((tab) => (
              <li key={tab} className="mb-2">
                <button
                  onClick={() => {
                    setActiveTab(tab);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 rounded-lg ${
                    activeTab === tab
                      ? "bg-black text-white"
                      : "hover:bg-gray-200"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-4 lg:p-8">
        <h1 className="text-2xl font-bold mb-4 mt-6 lg:mt-0">
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}{" "}
          {activeTab === "dailyreports" ? "Report" : "Orders"}
        </h1>
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader />
          </div>
        ) : activeTab === "dashboard" ? (
          <p>
            Welcome to the admin dashboard. Select a category to view orders.
          </p>
        ) : activeTab === "dailyreports" ? (
          <>
            <DailyReportsDatePicker />
            {showDailyReportTable && orders.length > 0 ? (
              <DailyReportsTable orders={orders} />
            ) : showDailyReportTable ? (
              <p>No data found for the selected date.</p>
            ) : null}
          </>
        ) : orders.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {orders.map((order) => (
              <OrderCard key={order.order_id} order={order} />
            ))}
          </div>
        ) : (
          <p>No data found for this category.</p>
        )}
      </div>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              Enter Shipment Details
            </h2>

            <label className="block mb-3">
              Consignment Number:
              <input
                type="text"
                value={consignmentNumber}
                onChange={(e) => setConsignmentNumber(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </label>

            <label className="block mb-3">
              Tracking URL:
              <input
                type="url"
                value={trackingUrl}
                placeholder="https://example.com"
                onChange={(e) => setTrackingUrl(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </label>

            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={handleFormSubmit}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200"
              >
                Submit
              </button>

              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Admin;
