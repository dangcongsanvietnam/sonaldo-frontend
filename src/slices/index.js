import { combineReducers } from "redux";
import authSlice from "./authSlice";
import userSlice from "./userSlice";
import addressSlice from "./addressSlice";
import productSlice from "./productSlice";
import brandSlice from "./brandSlice";
import categorySlice from "./categorySlice";
import cartSlice from "./cartSlice";

const reducers = combineReducers({
  auth: authSlice,
  user: userSlice,
  address: addressSlice,
  product: productSlice,
  brand: brandSlice,
  category: categorySlice,
  cart: cartSlice,
});

export default reducers;
