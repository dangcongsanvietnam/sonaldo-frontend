import ImgCrop from "antd-img-crop";
import { Upload } from "antd";
import "./index.css";

const getSrcFromFile = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file.originFileObj);
    reader.onload = () => resolve(reader.result);
  });
};

const ImageUpload = ({ fileList, setFileList, vnMode, info, blogState }) => {
  const onChange = ({ fileList: newFileList }) => {
    let updatedFileList = newFileList.map((file) => {
      const existingFile = fileList.find((f) => f.uid === file.uid);
      return {
        ...file,
        originFileObj:
          file.originFileObj ||
          existingFile?.originFileObj ||
          file.originFileObj,
      };
    });

    if (blogState) {
      updatedFileList = updatedFileList.slice(-1); // ✅ Keep only the latest uploaded image for blog
    }

    setFileList(updatedFileList);
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

  const beforeUpload = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve(file);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  return (
    <div>
      {blogState ? (
        // ✅ No cropping for blog images, fully flexible
        <Upload
          listType="picture-card"
          fileList={fileList}
          onChange={onChange}
          onPreview={onPreview}
          beforeUpload={beforeUpload}
          customRequest={customRequest}
        >
          {fileList.length === 0 && (vnMode ? "+ Tải lên" : "+ Upload")}
        </Upload>
      ) : (
        // ✅ Cropping enabled for non-blog images
        <ImgCrop rotationSlider showReset cropShape="square">
          <Upload
            listType="picture-card"
            fileList={fileList}
            onChange={onChange}
            onPreview={onPreview}
            beforeUpload={beforeUpload}
            customRequest={customRequest}
          >
            {fileList.length === 0 && (vnMode ? "+ Tải lên" : "+ Upload")}
          </Upload>
        </ImgCrop>
      )}
    </div>
  );
};

export default ImageUpload;
