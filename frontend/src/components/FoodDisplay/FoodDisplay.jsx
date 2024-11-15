import React, { useContext, useState } from "react";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";
import Toast from "../Toast"; // Ensure this import is correct
import SearchWithFilter from "../SearchWithFilter";
import FilterComponent from "../Filter";
import { useNavigate } from "react-router-dom";
import SearchBar from "../SearchBar";
const FoodDisplay = ({ category, setCategory, searchTerm, setSearchTerm }) => {
  const { food_list } = useContext(StoreContext);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedWeight, setSelectedWeight] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [toastKey, setToastKey] = useState(0);
  const [selectedShell, setSelectedShell] = useState(true);
  const [filterSelected, setFilterSelected] = useState(false);
  const navigate = useNavigate();

  const toggleFilter = () => {
    setFilterSelected(!filterSelected);
  };

  const filteredFoodList = food_list.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.category &&
        item.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setQuantity(1);
    setSelectedWeight(item.weights[0].weight); // Set default to first available weight
    document.body.classList.add("overflow-hidden");
  };

  const handleCloseOverlay = () => {
    setSelectedItem(null);
    document.body.classList.remove("overflow-hidden");
  };

  const handleQuantityChange = (change) => {
    setQuantity((prev) => Math.max(1, prev + change));
  };

  const getWeightPrice = () => {
    if (!selectedItem || !selectedWeight) return 0;
    const weightOption = selectedItem.weights.find(
      (w) => w.weight === selectedWeight
    );
    return weightOption ? weightOption.price : 0;
  };

  const getmrpPrice = () => {
    if (!selectedItem || !selectedWeight) return 0;
    const weightOption = selectedItem.weights.find(
      (w) => w.weight === selectedWeight
    );
    return weightOption ? weightOption.mrp : 0;
  };

  const gstValue = () => {
    if (!selectedItem || !selectedWeight) return 0;
    const weightOption = selectedItem.weights.find(
      (w) => w.weight === selectedWeight
    );
    return weightOption ? weightOption.gst : 0;
  };

  const handleAddToCart = () => {
    if (!selectedItem) return;
    const cartItem = {
      name: selectedItem.name,
      quantity,
      weight: selectedWeight,
      price: getWeightPrice(),
      totalprice: getWeightPrice() * quantity,
      image: selectedItem.image,
      category: selectedItem.category,
      gst: selectedItem.gst,
      mrp: getmrpPrice(),
      gstValue: gstValue() * quantity,
    };
    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
    console.log(cartItem);
    existingCart.push(cartItem);
    localStorage.setItem("cart", JSON.stringify(existingCart));
    const event = new Event("storage");
    window.dispatchEvent(event);
    setToastMessage("Item added successfully!");
    setToastKey((prevKey) => prevKey + 1);
    handleCloseOverlay();
    console.log("Item added:", {
      name: selectedItem.name,
      mrp: getmrpPrice(),
      price: getWeightPrice(),
      quantity: quantity,
      // calculatedSavings: (getmrpPrice() - getWeightPrice()) * quantity
    });
  };

  const handleBuyNow = () => {
    if (!selectedItem) return;
    const cartItem = {
      name: selectedItem.name,
      quantity,
      weight: selectedWeight,
      price: getWeightPrice(),
      totalprice: getWeightPrice() * quantity,
      image: selectedItem.image,
      category: selectedItem.category,
      gst: selectedItem.gst,
      mrp: getmrpPrice(),
      gstValue: gstValue() * quantity,
    };
    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
    existingCart.push(cartItem);
    localStorage.setItem("cart", JSON.stringify(existingCart));
    const event = new Event("storage");
    window.dispatchEvent(event);
    setToastMessage("Item added successfully!");
    setToastKey((prevKey) => prevKey + 1);
    handleCloseOverlay();
    navigate("/cart");
  };

  return (
    <div className="" id="food-display">
      {/* <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        
      /> */}

      <div className="grid grid-cols-2 md:grid-cols-3">
        {filteredFoodList.length > 0 ? (
          <div
            className={`${
              filterSelected
                ? "col-span-2 md:col-span-2 md:w-full"
                : "col-span-2 md:col-span-3 md:w-full"
            } grid gap-4 md:gap-8 lg:gap-10 grid-cols-2 md:grid-cols-3 ${
              filterSelected
                ? "grid-cols-2 md:grid-cols-2 md:max-w-screen-lg mx-auto lg:grid-cols-3"
                : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            } mt-14 mx-auto md:max-w-screen-xl sm:px-6 lg:px-8 mb-10`} // Added px-4 for mobile spacing
          >
            {filteredFoodList.map((item, index) =>
              item.availability === "Available" ? (
                <FoodItem
                  key={index}
                  item={item}
                  onClick={() => handleItemClick(item)}
                />
              ) : <></>
            )}
          </div>
        ) : (
          <div className="col-span-3">
            <div className="flex flex-col items-center justify-center mt-20">
              <h2 className="text-2xl font-bold text-gray-700 mb-4">
                No Products Found
              </h2>
              <p className="text-gray-500 mb-10">
                Try adjusting your search or filter to find what you're looking
                for!
              </p>
            </div>
          </div>
        )}
        {filterSelected ? (
          <FilterComponent
            isOpen={filterSelected}
            setIsOpen={setFilterSelected}
            // applyFilters={applyFilters}
          />
        ) : (
          ""
        )}
      </div>

      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50">
          <div
            className="bg-white rounded-t-3xl md:rounded-xl p-6 w-full md:w-[636px] relative md:translate-y-0 md:h-auto h-[600px] animate-slideUp md:animate-none"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src="closeoverlay.svg"
              onClick={handleCloseOverlay}
              className="cursor-pointer absolute top-[-17px] right-4 text-gray-500 hover:text-gray-700 z-10"
            />
            <div className="overflow-y-auto scrollbar-hide h-full">
              <div className="flex flex-col md:flex-row gap-4">
                <img
                  src={selectedItem.image[0]}
                  alt={selectedItem.name}
                  className="w-full h-auto md:w-[320px] md:h-[282px] rounded-xl"
                />
                <div className="flex flex-col justify-start">
                  <h2 className="text-[16px] font-bold font-Nunito mb-2">
                    {selectedItem.name}
                  </h2>
                  <p className="text-[#909090] text-[12px] font-Nunito font-[400px] mb-2">
                    {selectedItem.description}
                  </p>
                  <div
                    className="flex gap-1 cursor-pointer"
                    onClick={() => setSelectedShell(!selectedShell)}
                  >
                    <p className="font-Nunito font-bold text-[12px] md:text-[14px] text-[#909090]">
                      SHELF LIFE:
                    </p>
                    {selectedShell ? (
                      <img src="down.svg" className="cursor-pointer" />
                    ) : (
                      <img src="up.svg" className="cursor-pointer" />
                    )}
                  </div>

                  {selectedShell ? (
                    <></>
                  ) : (
                    <p className="font-extrabold font-Nunito text-[12px] text-[#606060] md:text-[14px]">
                      {selectedItem.life}
                    </p>
                  )}

                  <hr className="mt-2" />

                  {/* <div className="flex gap-2 mt-4">
                    {["250G", "500G", "1 KG"].map((weight) => (
                      <button
                        key={weight}
                        onClick={() => setSelectedWeight(weight)}
                        className={`px-[12px] py-[4px] md:px-[14px] md:py-[6px] font-Nunito font-extrabold text-[#606060] text-[12px] rounded ${
                          selectedWeight === weight
                            ? "border-2 border-[#F7AE1C] bg-[#FFFCF4]"
                            : "border-2 border-[#E6E6E6]"
                        }`}
                      >
                        {weight}
                      </button>
                    ))}
                  </div> */}
                  <div className="flex gap-2 mt-4">
                    {selectedItem.weights.map((weightOption) => (
                      <button
                        key={weightOption.weight}
                        className={`px-[12px] py-[4px] md:px-[14px] md:py-[6px] font-Nunito font-extrabold text-[#606060] text-[12px] rounded ${
                          selectedWeight === weightOption.weight
                            ? "border-2 border-[#F7AE1C] bg-[#FFFCF4]"
                            : "border-2 border-[#E6E6E6]"
                        }`}
                        onClick={() => setSelectedWeight(weightOption.weight)}
                      >
                        {weightOption.weight}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 mt-4 justify-between mb-16 md:mb-4">
                    <p className="text-[17px] font-bold text-[#000000] font-Nunito">
                      ₹{getWeightPrice()}{" "}
                      <span className="line-through text-[#606060] text-[14px]">
                        ₹{getmrpPrice()}
                      </span>
                      <p className="text-[14px] font-bold text-[#26A460] font-Nunito">
                        You save ₹{getmrpPrice() - getWeightPrice()}
                      </p>
                    </p>
                    <div className="bg-[#F8F8F8] border border-[#E6E6E6] px-2 rounded-lg">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        className="px-2 py-1 rounded"
                      >
                        -
                      </button>
                      <span className="mx-2 font-bold text-[#303030] text-[14px] font-Nunito">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        className="px-2 py-1 rounded"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-0 fixed md:relative bg-white w-full bottom-0 py-4 md:py-0">
                    <button
                      className="border border-[#6B4B34] text-[#6B4B34] font-bold py-2 px-2 rounded-xl flex gap-1 font-Nunito hover:bg-[#6B4B3420]"
                      onClick={handleAddToCart}
                    >
                      <span>
                        <img src="Cart.svg" className="mt-[2px]" />
                      </span>
                      Add to cart
                    </button>
                    <button
                      className="bg-[#332D21] text-white font-bold py-2 px-4 rounded-xl font-Nunito"
                      onClick={handleBuyNow}
                    >
                      Buy now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <Toast key={toastKey} message={toastMessage} duration={4000} />
    </div>
  );
};

export default FoodDisplay;
