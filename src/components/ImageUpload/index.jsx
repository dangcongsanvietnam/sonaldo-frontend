import { useEffect, useState } from "react";
import ImgCrop from "antd-img-crop";
import { Upload, message } from "antd";
import { useSelector } from "react-redux";

const getSrcFromFile = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file.originFileObj);
    reader.onload = () => resolve(reader.result);
  });
};
const ImageUpload = ({ fileList, setFileList, setAvatar, avatar }) => {
  // const onChange = ({ fileList: newFileList }) => {
  //   setFileList(newFileList);
  //   if (newFileList.length > 0) {
  //     const latestFile = newFileList[newFileList.length - 1];
  //     if (latestFile.originFileObj) {
  //       setAvatar(latestFile.originFileObj);
  //     }
  //   }
  // };

  // const onChange = ({ fileList: newFileList }) => {
  //   // Preserve originFileObj if it exists
  //   const updatedFileList = newFileList.map((file) => {
  //     const existingFile = fileList.find((f) => f.uid === file.uid);
  //     return {
  //       ...file,
  //       originFileObj: file.originFileObj || existingFile?.originFileObj,
  //     };
  //   });

  //   setFileList(updatedFileList);

  //   if (updatedFileList.length > 0) {
  //     const latestFile = updatedFileList[updatedFileList.length - 1];
  //     if (latestFile.originFileObj) {
  //       setAvatar(latestFile.originFileObj);
  //     }
  //   }
  // };

  const onChange = ({ fileList: newFileList }) => {
    const updatedFileList = newFileList.map((file) => {
      const existingFile = fileList.find((f) => f.uid === file.uid);
      return {
        ...file,
        originFileObj:
          file.originFileObj ||
          existingFile?.originFileObj ||
          file.originFileObj,
      };
    });

    setFileList(updatedFileList);

    if (updatedFileList.length > 0) {
      const latestFile = updatedFileList[updatedFileList.length - 1];
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
    <>
      <ImgCrop rotationSlider showReset cropShape="square">
        <Upload
          listType="picture-card"
          fileList={fileList}
          onChange={onChange}
          onPreview={onPreview}
          customRequest={customRequest} // Ngăn chặn tải lên tự động
        >
          {fileList.length < 5 && "+ Upload"}
        </Upload>
      </ImgCrop>
    </>
  );
};

export default ImageUpload;
