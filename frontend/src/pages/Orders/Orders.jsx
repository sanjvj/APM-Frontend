import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Slider from '../../components/Slider/Slider';

import Footer from '../../components/Footer';
import FooterBar from '../../components/FooterBar';
import ShopHero from '../../components/ShopHero';
import OrderHero from '../../components/OrderHero';
import CartHeader from '../../components/CartHeader';
const Orders = () => {
 
  const [cartItemCount, setCartItemCount] = useState(0);

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
  return <div>
     <Navbar cartItemCount={cartItemCount} />
     <Slider></Slider>
     <CartHeader></CartHeader>
     <OrderHero></OrderHero>
     <ShopHero />
     <Footer></Footer>
      <FooterBar cartItemCount={cartItemCount}></FooterBar>
  </div>;
};

export default Orders;
