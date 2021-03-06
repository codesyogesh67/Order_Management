import React from "react";
import ProductsList from "./ProductsList";
import AddProducts from "./AddProducts";
import "./Products.css";
import { useSelector } from "react-redux";
import { selectUser } from "../../features/userSlice";
import CartItems from "./CartItems";

function Products() {
  const { userInfo } = useSelector(selectUser);

  return (
    <div className="products">
      <div className="mainbody">
        {userInfo?.role === "Manager" || userInfo?.role === "Employee" ? (
          <AddProducts />
        ) : (
          <CartItems />
        )}

        <ProductsList />
      </div>
    </div>
  );
}

export default Products;
