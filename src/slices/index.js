import { combineReducers } from "redux";
import authSlice from "./authSlice";
import userSlice from "./userSlice";
import addressSlice from "./addressSlice";
import productSlice from "./productSlice";
import brandSlice from "./brandSlice";
import categorySlice from "./categorySlice";
import changelogSlice from "./changelogSlice";
import cartSlice from "./cartSlice";
import searchSlice from "./searchSlice";
import orderSlice from "./orderSlice";

const reducers = combineReducers({
  auth: authSlice,
  user: userSlice,
  address: addressSlice,
  product: productSlice,
  brand: brandSlice,
  category: categorySlice,
  cart: cartSlice,
  changelog: changelogSlice,
  search: searchSlice,
  order: orderSlice,
});

export default reducers;
