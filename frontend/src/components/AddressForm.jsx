import React, { useContext, useState, useEffect } from "react";
import { CartContext } from "../context/CartContext"; // Adjust the import path as needed
import axios from "axios";

const AddressForm = ({ onClose, setHasVerified,handlePlaceOrder }) => {
  const { formData, updateFormData, addAddress } = useContext(CartContext);
  const [showVerifyCheckbox, setShowVerifyCheckbox] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isAddressAvailable, setIsAddressAvailable] = useState(null);
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    setShowVerifyCheckbox(formData.pincode && formData.pincode.length === 6);
  }, [formData.pincode]);

  useEffect(() => {
    setIsFormValid(
      formData.name &&
        formData.mobile &&
        formData.pincode &&
        formData.addressLine1 &&
        formData.addressLine2 &&
        formData.city &&
        formData.state &&
        isAddressAvailable
    );
  }, [formData, isAddressAvailable]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
    if (name === "pincode") {
      setIsAddressAvailable(null);
    }
  };

  const handleVerifyAddress = async () => {
    setIsVerifying(true);
    try {
      const response = await axios.post(
        "https://www.tst.annapoornamithai.com/feature/checkPincode",
        {
          pincode: formData.pincode,
        }
      );
      setIsAddressAvailable(response.data.status);
    } catch (error) {
      console.error("Error verifying address:", error);
      setIsAddressAvailable(false);
    }
    setIsVerifying(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormValid) {
      addAddress();
      onClose();
      setHasVerified(false);
      handlePlaceOrder();
    }
  };

  // Calculate the minimum date for pre-order (1 week from today)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 7);
  const minDateString = minDate.toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-8 w-[400px] relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4">
          <img src="closeoverlay.svg" alt="Close" />
        </button>
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <span className="mr-2"></span> Personal & Delivery Address
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Please enter the all details to create your account
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-[#FAAF40] mb-2">
              PERSONAL DETAILS*
            </h3>
            <input
              type="text" pattern="[A-Z a-z]*"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Name"
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <input
              type="number"
              maxLength='10'
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="Mobile Number"
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your mail Id"
              className="w-full p-2 border rounded"
            />
          </div>
          <h3 className="text-sm font-semibold text-[#FAAF40] mb-2">
            DELIVERY DETAILS*
          </h3>
          <div className="mb-4">
            <input
              type="text"
              name="addressLine1"
              value={formData.addressLine1}
              onChange={handleChange}
              placeholder="Door no./Street"
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <input
              type="text"
              name="addressLine2"
              value={formData.addressLine2}
              onChange={handleChange}
              placeholder="Address Line 2"
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="flex gap-2">
            <div className="mb-4">
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter your city"
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Enter your state"
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          <div className="mb-4">
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              placeholder="Pin code"
              className="w-full p-2 border rounded"
              required
            />
          </div>
          {showVerifyCheckbox && (
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isVerifying}
                  onChange={handleVerifyAddress}
                  className="mr-2"
                />
                Check Address Availability
              </label>
            </div>
          )}
          {isAddressAvailable !== null && (
            <div
              className={`mb-4 ${
                isAddressAvailable ? "text-green-600" : "text-red-600"
              }`}
            >
              {isAddressAvailable
                ? "Address is available"
                : "Address is not available"}
            </div>
          )}

          {/* <div className="mb-4">
            <h3 className="text-sm font-semibold text-[#FAAF40] mb-2">PRE-ORDER OPTION</h3>
            <select
              name="preOrder"
              onChange={handlePreOrderChange}
              className="w-full p-2 border rounded"
            >
              <option value="no">No, I want standard delivery</option>
              <option value="yes">Yes, I want to pre-order</option>
            </select>
          </div>
          {isPreOrder && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-[#FAAF40] mb-2">SELECT PRE-ORDER DATE</h3>
              <input
                type="date"
                name="preOrderDate"
                min={minDateString}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          )} */}
          <button
            type="submit"
            className={`w-full font-bold py-3 px-4 rounded-lg ${
              isFormValid
                ? "bg-[#332D21] text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            disabled={!isFormValid}
          >
            Proceed to Payment
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddressForm;
