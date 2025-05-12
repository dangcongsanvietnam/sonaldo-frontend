import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getBlogDetail, getRelatedBlogs } from "../../services/feedbackService";

const extractLink = (text) => {
    const match = text.match(/(facebook|twitter|instagram|linkedin)="([^"]+)"/);
    return match ? { platform: match[1], url: `https://${match[1]}.com` } : null;
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
};

const BlogPage = () => {
    const scrollRef = useRef(null);
    const [scrollPercentage, setScrollPercentage] = useState(0);
    const { blogId } = useParams();
    const dispatch = useDispatch();
    const { blog, relatedBlogs } = useSelector((state) => state?.feedbacks);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            const container = scrollRef.current;
            if (!container) return;

            const maxScroll = container.scrollWidth - container.clientWidth;
            const currentScroll = container.scrollLeft;
            const percent = (currentScroll / maxScroll) * 100;

            setScrollPercentage(percent);
        };

        const container = scrollRef.current;
        container?.addEventListener("scroll", handleScroll);
        return () => container?.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        dispatch(getBlogDetail(blogId));
        dispatch(getRelatedBlogs(blogId));
    }, [blogId, dispatch]);

    return (
        <>
            <img
                src={`data:image/jpeg;base64,${blog?.image?.file.data}`}
                className="w-full"
            />
            <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
                <h1 className="text-3xl font-bold mb-2">{blog?.subject}</h1>
                <p className="text-gray-500 text-sm">By {blog?.writer} - {formatDate(blog?.createdAt)}</p>
                {/* <p className="text-sm text-gray-400">State: {blog?.state}</p> */}

                {/* Blog Content */}
                <div
                    className="mt-4 text-gray-700"
                    dangerouslySetInnerHTML={{ __html: blog?.content }}
                />

                {/* Tags */}
                <div className="mt-4">
                    <p className="font-semibold text-gray-700">Tags:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {blog?.tags?.map((tag, index) => (
                            <span
                                key={tag.tagId}
                                className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm"
                            >
                                {tag.tagName}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Social Links */}
                <div className="mt-4">
                    <p className="font-semibold text-gray-700">Follow us on:</p>
                    <div className="flex gap-4 mt-2">
                        {blog?.links?.map((link, index) => {
                            const extracted = extractLink(link);
                            return (
                                extracted && (
                                    <a
                                        key={index}
                                        href={extracted.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:underline"
                                    >
                                        {extracted.platform}
                                    </a>
                                )
                            );
                        })}
                    </div>
                </div>

                <div className="mt-4 text-gray-500 text-sm">
                </div>

            </div>
            <div className="my-6 mx-14 items-center">
                <h2 className="text-2xl font-bold text-center">Related Blogs</h2>

                <div className="relative mt-4">
                    {relatedBlogs?.length > 0 ? (
                        <>
                            <div
                                ref={scrollRef}
                                className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory p-2"
                                style={{
                                    scrollBehavior: "smooth",
                                    scrollbarWidth: "none",
                                    msOverflowStyle: "none",
                                }}
                            >
                                {relatedBlogs.map((item, index) => (
                                    <div
                                        key={index}
                                        className="p-4 rounded-lg text-center flex-shrink-0 w-[300px] snap-start"
                                    >
                                        <img
                                            src={`data:image/jpeg;base64,${item?.image?.file.data}`}
                                            alt={item.title}
                                            className="w-[300px] h-[200px] object-cover mx-auto"
                                        />
                                        <h3 className="text-lg font-semibold mt-3">{item.subject}</h3>
                                        <span
                                            className="text-blue-500 cursor-pointer"
                                            onClick={() => navigate(`/blog/${item.blogId}`)}
                                        >
                                            Read More
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="relative mt-4 h-2 bg-gray-300 rounded-full overflow-hidden">
                                <div
                                    className="absolute top-0 h-2 bg-gray-600 rounded-full transition-all duration-200"
                                    style={{
                                        width: "50px",
                                        left: `${scrollPercentage}%`,
                                        transform: "translateX(-50%)",
                                    }}
                                ></div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center text-gray-500 mt-4">
                            <p>No related blogs found.</p>
                        </div>
                    )}
                </div>

            </div>

        </>

    );
};

export default BlogPage;
