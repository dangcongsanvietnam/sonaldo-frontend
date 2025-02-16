import ImgCrop from "antd-img-crop";
import { Upload, message } from "antd";

const getSrcFromFile = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file.originFileObj);
    reader.onload = () => resolve(reader.result);
  });
};

const ImageUpload = ({ fileList, setFileList, setAvatar }) => {
  const MIN_WIDTH = 200; // Chiều rộng tối thiểu
  const MIN_HEIGHT = 200; // Chiều cao tối thiểu
  const MAX_WIDTH = 2000; // Chiều rộng tối đa
  const MAX_HEIGHT = 2000; // Chiều cao tối đa

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
      image.style.width = "300px"; // Đảm bảo hiển thị hợp lý
      image.style.height = "300px";
      image.style.objectFit = "cover"; // Tự fit hoặc cover
      imgWindow.document.body.style.display = "flex";
      imgWindow.document.body.style.justifyContent = "center";
      imgWindow.document.body.style.alignItems = "center";
      imgWindow.document.body.style.margin = "0";
      imgWindow.document.body.style.background = "#f0f0f0";
      imgWindow.document.body.appendChild(image);
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
    <div className="flex items-center space-x-4">
      <ImgCrop rotationSlider showReset cropShape="square">
        <Upload
          listType="picture-card"
          fileList={fileList}
          onChange={onChange}
          onPreview={onPreview}
          beforeUpload={beforeUpload}
          customRequest={customRequest}
        >
          {fileList.length < 5 && "+ Upload"}
        </Upload>
      </ImgCrop>
    </div>
  );
};

export default ImageUpload;
