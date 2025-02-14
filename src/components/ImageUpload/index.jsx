import ImgCrop from "antd-img-crop";
import { Upload, message } from "antd";
import './index.css'

const getSrcFromFile = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file.originFileObj);
    reader.onload = () => resolve(reader.result);
  });
};

const ImageUpload = ({ fileList, setFileList, vnMode, info }) => {
  const MIN_WIDTH = 200;
  const MIN_HEIGHT = 200;
  const MAX_WIDTH = 2000;
  const MAX_HEIGHT = 2000;

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
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const { width, height } = img;
        if (
          width < MIN_WIDTH ||
          height < MIN_HEIGHT ||
          width > MAX_WIDTH ||
          height > MAX_HEIGHT
        ) {
          message.error(
            `Ảnh phải có kích thước từ ${MIN_WIDTH}x${MIN_HEIGHT}px đến ${MAX_WIDTH}x${MAX_HEIGHT}px.`
          );
          reject();
        } else {
          resolve(file);
        }
      };
      img.src = URL.createObjectURL(file);
    });
  };

  return (
    <div className="">
      {info ? (
        <div>
          <Upload
            listType="picture-card"
            fileList={fileList}
            onChange={onChange}
            onPreview={onPreview}
            beforeUpload={beforeUpload}
            customRequest={customRequest}
          >
            {fileList.length < 5 && vnMode ? "+ Tải lên" : "+ Upload"}
          </Upload>
        </div>
      ) : (
        <ImgCrop rotationSlider showReset cropShape="square">
          <Upload
            listType="picture-card"
            fileList={fileList}
            onChange={onChange}
            onPreview={onPreview}
            beforeUpload={beforeUpload}
            customRequest={customRequest}
          >
            {fileList.length < 5 && vnMode ? "+ Tải lên" : "+ Upload"}
          </Upload>
        </ImgCrop>
      )}
    </div>
  );
};

export default ImageUpload;