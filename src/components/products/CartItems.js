import React, { useState, useEffect } from "react";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import CloseTwoToneIcon from "@material-ui/icons/CloseTwoTone";
import {
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@material-ui/core";
import "./CartItems.css";
import db from "../../firebase";
import { useSelector } from "react-redux";

import { selectUserInfo } from "../../features/userSlice";
import firebase from "firebase";

function CartItems() {
  const [cartList, setCartList] = useState([]);
  const [docIds, setDocIds] = useState([]);
  const { userInfo } = useSelector(selectUserInfo);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);

  const id = JSON.parse(localStorage.getItem("userdocId"));
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    db.collection("users")
      .doc(id)
      .collection("cartItems")
      .onSnapshot((snapshot) => {
        setCartList(
          snapshot.docs.map((doc) => ({
            cartItemId: doc.id,
            data: doc.data(),
          }))
        );
      });
    totalAmount();
    totalItems();
  }, []);

  const orderRequested = () => {
    db.collection("orders").add({
      list: cartList,
      customer: userInfo,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      totalPrice,
      totalQuantity,
      status: "Processing",
    });

    const docsdeleted = cartList?.map((doc) => {
      db.collection("users")
        .doc(id)
        .collection("cartItems")
        .doc(doc.cartItemId)
        .delete();
    });
  };

  const increaseQuantity = (cartItemId, quantity) => {
    db.collection("users")
      .doc(id)
      .collection("cartItems")
      .doc(cartItemId)
      .update({
        quantity: Number(quantity) + 1,
      });
  };

  const decreaseQuantity = (cartItemId, quantity) => {
    if (quantity > 1) {
      db.collection("users")
        .doc(id)
        .collection("cartItems")
        .doc(cartItemId)
        .update({
          quantity: Number(quantity) - 1,
        });
    }
  };

  const totalAmount = () => {
    db.collection("users")
      .doc(id)
      .collection("cartItems")
      .onSnapshot((snapshot) => {
        const totalprice = snapshot.docs.map(
          (doc) => Number(doc.data().price) * Number(doc.data().quantity)
        );

        setTotalPrice(
          totalprice.reduce((a, b) => {
            return a + b;
          }, 0)
        );
      });
  };

  const totalItems = () => {
    db.collection("users")
      .doc(id)
      .collection("cartItems")
      .onSnapshot((snapshot) => {
        const totalquantity = snapshot.docs.map((doc) => doc.data().quantity);
        setTotalQuantity(
          totalquantity.reduce((a, b) => {
            return a + b;
          }, 0)
        );
      });
  };

  const deleteCartItem = (cartItemId) => {
    db.collection("users")
      .doc(id)
      .collection("cartItems")
      .doc(cartItemId)
      .delete();
  };

  return (
    <div className="cartItems">
      <p className="cartItems__title">CartItems</p>
      <TableContainer component={Paper}>
        <Table stickyHeader size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell>Sn.</TableCell>
              <TableCell>Product</TableCell>
              <TableCell align="center">Price&nbsp;(dollars/each)</TableCell>
              <TableCell align="center">Quantity&nbsp;</TableCell>
              <TableCell align="center">Total Price</TableCell>
              <TableCell align="center"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cartList?.map(
              ({ cartItemId, data: { name, price, quantity } }, index) => (
                <TableRow key={cartItemId}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell component="th" scope="row">
                    {name}
                  </TableCell>

                  <TableCell align="center"> $ {price}</TableCell>
                  <TableCell className="cartItems__quantity" align="center">
                    <ChevronLeftIcon
                      onClick={() => decreaseQuantity(cartItemId, quantity)}
                    />
                    <p>{quantity}</p>

                    <ChevronRightIcon
                      onClick={() => increaseQuantity(cartItemId, quantity)}
                    />
                  </TableCell>
                  <TableCell align="center">{price * quantity}</TableCell>
                  <TableCell align="center">
                    <CloseTwoToneIcon
                      className="cartItems__deleteIcon"
                      onClick={() => deleteCartItem(cartItemId)}
                    />
                  </TableCell>
                </TableRow>
              )
            )}
            {cartList.length > 0 && (
              <TableRow>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell align="center">Total</TableCell>
                <TableCell align="center"> {totalQuantity}</TableCell>
                <TableCell align="center">$ {totalPrice}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <button
        onClick={orderRequested}
        disabled={totalQuantity === 0}
        className="cartItems__proceedButton"
      >
        Place Order
      </button>
    </div>
  );
}

export default CartItems;
