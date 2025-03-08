import React, { useEffect, useState } from "react";
import { Form, Input, Button, Tag } from "antd";
import { useDispatch, useSelector } from "react-redux";
import TextEditor from "../../components/TextEditor";
import { Bounce, toast, ToastContainer } from "react-toastify";
import { createFeedback } from "../../services/feedbackService";
import { useOutletContext } from "react-router-dom";
import { suggestTagsFromText } from "../../utils/suggestTagsFromText";

const socialPlatforms = ["facebook", "twitter", "instagram", "linkedin"];

const CreateBlog = () => {
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const [tags, setTags] = useState([]);
    const [suggestedTags, setSuggestedTags] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [links, setLinks] = useState({ facebook: "", twitter: "", instagram: "", linkedin: "" });
    const user = useSelector((state) => state.user.data);
    const name = user?.firstName + " " + user?.lastName;
    const { vnMode } = useOutletContext();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        form.setFieldsValue({ writer: name });
    }, [user]);

    useEffect(() => {
        handleTagBlur();
    }, [tags]);

    const handleInputChange = (e) => setInputValue(e.target.value);

    const handleInputConfirm = () => {
        if (inputValue.trim() && !tags.includes(inputValue.trim())) {
            setTags([...tags, inputValue.trim()]);
        }
        setInputValue("");
    };

    const handleTagBlur = () => {
        const name = form.getFieldValue("subject");
        const description = form.getFieldValue("content");
        const writer = form.getFieldValue("writer");

        if (name || description || writer) {
            const suggested = suggestTagsFromText(name, description, [], writer, "");
            const uniqueSuggestions = suggested.filter((tag) => !tags.includes(tag));
            setSuggestedTags(uniqueSuggestions);
        }
    };

    const handleSubmit = async (values) => {
        setLoading(true);
        const filteredTags = tags
            .filter((tag) => tag.trim() !== "")
            .map((tag) => (tag.startsWith("#") ? tag : `#${tag.trim()}`));

        const formattedLinks = Object.entries(links)
            .filter(([platform, url]) => url.trim() !== "")
            .map(([platform, url]) => `${platform}="${url}"`);

        const payload = {
            subject: values.subject,
            content: values.content,
            writer: values.writer,
            links: formattedLinks,
            tagsDescription: filteredTags.join(" "),
        };

        try {
            await dispatch(createFeedback(payload)).unwrap();
            toast.success("Blog created successfully!");
            setLoading(false);
        } catch (error) {
            toast.error("Failed to create blog!");
            setLoading(false);
        }
    };

    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                transition={Bounce}
            />
            <Form form={form} layout="vertical" onFinish={handleSubmit} className="w-full max-w-2xl">
                <Form.Item label="Title" name="subject" rules={[{ required: true, message: "Please enter a title!" }]}>
                    <Input placeholder="Enter blog title" onBlur={handleTagBlur} />
                </Form.Item>

                <Form.Item
                    label="Writer Name"
                    name="writer"
                    rules={[{ required: true, message: "Please enter writer name!" }]}
                >
                    <Input onBlur={handleTagBlur} />
                </Form.Item>


                <Form.Item label="Content" name="content" rules={[{ required: true, message: "Please enter content!" }]}>
                    <TextEditor onBlur={handleTagBlur} />
                </Form.Item>

                <div className="mb-5">
                    <div className="tags-container">
                        <div className="mb-1">{vnMode ? "Tag sản phẩm" : "Product Tags"}</div>
                        {tags.map((tag, index) => (
                            <Tag
                                key={`${tag}-${index}`}
                                closable
                                onClose={() => setTags((prevTags) => prevTags.filter((t) => t !== tag))}
                                style={{ marginBottom: "8px" }}
                            >
                                {tag}
                            </Tag>
                        ))}
                    </div>

                    <div className="flex gap-2 mt-1">
                        <Input
                            value={inputValue}
                            onChange={handleInputChange}
                            onPressEnter={(e) => {
                                e.preventDefault();
                                handleInputConfirm();
                            }}
                            onBlur={handleTagBlur}
                            placeholder={vnMode ? "Nhập tag (bắt đầu với #)" : "Enter tag (start with #)"}
                            style={{ width: "200px", marginBottom: "8px" }}
                        />
                        <Button type="primary" onClick={handleInputConfirm}>
                            {vnMode ? "Thêm tag" : "Add Tag"}
                        </Button>
                    </div>

                    {suggestedTags.length > 0 && (
                        <div className="mt-4">
                            <div className="suggested-tags">
                                <small className="mr-2">{vnMode ? "Gợi ý tag:" : "Suggested Tags:"}</small>
                                {suggestedTags.slice(0, 5).map((tag) => (
                                    <Tag
                                        key={tag}
                                        color="blue"
                                        onClick={() => !tags.includes(tag) && setTags([...tags, tag])}
                                        style={{ cursor: "pointer", marginBottom: "8px" }}
                                    >
                                        {tag}
                                    </Tag>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="mb-5">
                    <div className="mb-1">Social Links</div>
                    {socialPlatforms.map((platform) => (
                        <Input
                            key={platform}
                            value={links[platform]}
                            onChange={(e) => setLinks({ ...links, [platform]: e.target.value })}
                            placeholder={`${platform}="link"`}
                            addonBefore={<span className="capitalize">{platform}</span>}
                            className="mb-2"
                        />
                    ))}
                </div>

                <Form.Item>
                    <Button loading={loading} type="primary" htmlType="submit">Create Blog</Button>
                </Form.Item>
            </Form>
        </>
    );
};

export default CreateBlog;
