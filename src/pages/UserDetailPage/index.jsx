import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import UserLogModal from "../../components/Modal/UserLogModal";
import ReviewTable from "../../components/Table/ReviewTable";
import QuestionTable from "../../components/Table/QuestionTable";
import AddressTable from "../../components/Table/AddressTable";
import UserDetailForm from "../../components/Form/UserDetailForm";
import OrderTable from "../../components/Table/OrderTable";
import { GetUser } from "../../services/userService";
import { useParams } from "react-router-dom";

const UserDetailPage = () => {
  const dispatch = useDispatch();
  const userDetail = useSelector((state) => state.user.userInfo);
  console.log(userDetail)
  const { email } = useParams();

  useEffect(() => {
    dispatch(GetUser(email));
  }, [dispatch]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">User Detail</h1>
      {/* <div className="flex gap-4 mb-4">
        <UserLogModal logs={userDetail.userLogs} />
        <ReviewTable reviews={userDetail.reviews} />
        <QuestionTable questions={userDetail.questions} />
        <AddressTable addresses={userDetail.addresses} />
      </div> */}
      <div className="grid grid-cols-2 gap-x-5">
        <UserDetailForm user={userDetail} />
        <OrderTable orders={userDetail.orders} />
      </div>

    </div>
  );
};

export default UserDetailPage;
