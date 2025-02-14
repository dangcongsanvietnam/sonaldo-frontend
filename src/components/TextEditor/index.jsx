import React, { useState, useCallback, useEffect } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const uploadImage = async (base64) => {
  const formData = new FormData();
  formData.append("file", base64);
  formData.append("upload_preset", "baybeetoys");

  try {
    const response = await fetch("https://api.cloudinary.com/v1_1/dgs6xtas7/image/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    return data.secure_url; // Return image URL
  } catch (error) {
    console.error("Image upload failed", error);
    return null;
  }
};


const replaceBase64Images = async (htmlContent) => {
  const imgRegex = /<img[^>]+src="data:image\/[^;]+;base64[^">]+"[^>]*>/g;
  const matches = htmlContent.match(imgRegex);

  if (!matches) return htmlContent;

  for (let imgTag of matches) {
    const srcMatch = imgTag.match(/src="([^"]+)"/);
    if (!srcMatch) continue;

    const base64Data = srcMatch[1];

    if (base64Data.startsWith("data:image/")) {
      const imageUrl = await uploadImage(base64Data);
      if (imageUrl) {
        htmlContent = htmlContent.replace(base64Data, imageUrl);
      }
    }
  }
  
  return htmlContent;
};

const TextEditor = ({ value, onChange }) => {
  const [content, setContent] = useState(value || "");

  useEffect(() => {
    setContent(value);
  }, [value]);

  const handleChange = useCallback(async (newContent) => {
    const updatedContent = await replaceBase64Images(newContent);
    setContent(updatedContent);
    onChange(updatedContent);
  }, [onChange]);

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ font: [] }],
      [{ size: [] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ color: [] }, { background: [] }],
      [{ list: "ordered" }, { indent: "-1" }, { indent: "+1" }],
      [{ align: [] }],
      ["link", "image", "video"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "color",
    "background",
    "list",
    "indent",
    "align",
    "link",
    "image",
    "video",
  ];

  return <ReactQuill value={content} onChange={handleChange} modules={modules} formats={formats} />;
};

export default TextEditor;
