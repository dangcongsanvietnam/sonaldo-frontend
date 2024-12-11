import { useState } from "react";
import ImgCrop from "antd-img-crop";
import { Upload, message } from "antd";

const getSrcFromFile = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file.originFileObj);
    reader.onload = () => resolve(reader.result);
  });
};

const AvatarProfile = ({ isRegister, setAvatar, user }) => {
  const [fileList, setFileList] = useState(
    isRegister
      ? []
      : [
          {
            uid: "-1",
            url: `data:image/jpeg;base64,${user?.images[0].file.data}`,
          },
        ]
  );

  const onChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);

    if (newFileList.length > 0) {
      const latestFile = newFileList[newFileList.length - 1];
      if (latestFile.originFileObj) {
        setAvatar(latestFile.originFileObj);
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

  return (
    <ImgCrop showGrid rotationSlider showReset cropShape="round">
      <Upload
        listType="picture-card"
        fileList={fileList}
        onChange={onChange}
        onPreview={onPreview}
        customRequest={customRequest} // Ngăn chặn tải lên tự động
      >
        {fileList.length === 0 && "+ Upload"}
      </Upload>
    </ImgCrop>
  );
};

export default AvatarProfile;
