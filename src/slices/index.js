import { combineReducers } from "redux";
import authSlice from "./authSlice";
import userSlice from "./userSlice";
import addressSlice from "./addressSlice";
import productSlice from "./productSlice";
import brandSlice from "./brandSlice";
import categorySlice from "./categorySlice";
import changelogSlice from "./changelogSlice";
import orderSlice from "./orderSlice";
import reviewSlice from "./reviewSlice";
import questionSlice from "./questionSlice";
import feedbackSlice from "./feedbackSlice";
import emailSlice from "./emailSlice";
import informationSlice from "./informationSlice";
import cartSlice from "./cartSlice";
import searchSlice from "./searchSlice";


const reducers = combineReducers({
  auth: authSlice,
  user: userSlice,
  address: addressSlice,
  product: productSlice,
  brand: brandSlice,
  category: categorySlice,
  changelog: changelogSlice,
  orders: orderSlice,
  reviews: reviewSlice,
  questions: questionSlice,
  feedbacks: feedbackSlice,
  email: emailSlice,
  information: informationSlice,
  cart: cartSlice,
  changelog: changelogSlice,
  search: searchSlice,
  // order: orderSlice,
});

export default reducers;
