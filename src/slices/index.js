import { combineReducers } from "redux";
import authSlice from "./authSlice";
import userSlice from "./userSlice";
import addressSlice from "./addressSlice";
import productSlice from "./productSlice";
import brandSlice from "./brandSlice";
import categorySlice from "./categorySlice";
import changelogSlice from "./changelogSlice";

const reducers = combineReducers({
  auth: authSlice,
  user: userSlice,
  address: addressSlice,
  product: productSlice,
  brand: brandSlice,
  category: categorySlice,
  changelog: changelogSlice
});

export default reducers;
