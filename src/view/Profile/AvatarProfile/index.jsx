import { UploadOutlined } from '@ant-design/icons';
import { Button, Upload } from "antd";
import ImgCrop from "antd-img-crop";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { getUserInfo, updateUserInfo } from "../../../services/userService";
import { toast } from "react-toastify";
import './index.css';
import Cookies from "js-cookie";
import { useLoading } from '../../../provider/LoadingProvider';

const AvatarProfile = ({ user, vnMode }) => {
  const { startLoading, stopLoading } = useLoading();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const getSrcFromFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file.originFileObj);
      reader.onload = () => resolve(reader.result);
    });
  };

  const onChange = ({ fileList: newFileList }) => {
    setLoading(true);
    startLoading();
    if (newFileList.length > 0) {
      const latestFile = newFileList[0];
      if (latestFile.originFileObj) {
        const img = new Image();
        img.onload = () => {
          const updateValue = {
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            birthday: user.birthday ? user.birthday : null,
            avatar: latestFile.originFileObj,
          };

          dispatch(updateUserInfo(updateValue))
            .unwrap()
            .then(() => {
              const token = Cookies.get("token");
              dispatch(getUserInfo(token))
                .unwrap()
                .then(() => {
                  form.resetFields();
                  stopLoading();
                  setLoading(false);
                })
                .catch(() => {
                  stopLoading();
                  setLoading(false);
                });
              toast.success(vnMode ? "Cập nhật avatar thành công!" : "Avatar updated successfully!");
            })
            .catch(() => {
              setLoading(false);
              toast.error(vnMode ? "Cập nhật avatar thất bại!" : "Avatar update failed!");
            });
        };
        img.src = URL.createObjectURL(latestFile.originFileObj);
      }
    }
  };

  const onPreview = async (file) => {
    const src = file.url || (await getSrcFromFile(file));
    const imgWindow = window.open(src);

    if (imgWindow) {
      const image = new Image();
      image.src = src;
      imgWindow.document.write(image.outerHTML);
    } else {
      window.location.href = src;
    }
  };

  const customRequest = ({ onSuccess }) => {
    setTimeout(() => {
      onSuccess("ok");
    }, 0);
  };

  const buttonStyle = {
    cursor: loading ? "not-allowed" : "pointer",
    opacity: loading ? 0.6 : 1,
  };

  return (
    <ImgCrop rotationSlider showReset cropShape="square">
      <Upload
        onChange={onChange}
        onPreview={onPreview}
        customRequest={customRequest}
        maxCount={1}
        showUploadList={false}
        disabled={loading}
      >
        <Button
          style={buttonStyle}
          loading={loading}
          icon={<UploadOutlined />}
          className="w-44"
          disabled={loading}
        >
          {vnMode ? 'Bấm để tải ảnh lên' : 'Click to Upload'}
        </Button>
      </Upload>
    </ImgCrop>
  );
};

export default AvatarProfile;
