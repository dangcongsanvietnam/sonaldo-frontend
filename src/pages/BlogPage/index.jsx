import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getBlogDetail } from "../../services/feedbackService";

const blogData = {
    _id: "15b67405-9d6a-42cb-8969-6e2c61a42c2d",
    img: "https://www.lego.com/cdn/cs/set/assets/bltfd71e7b602a22206/01-Hero-Standard-AdultsWelcome-ArticleAsset-Project-Toot-Desktop.jpg?fit=crop&format=webply&quality=80&width=1600&height=500&dpr=1.5",
    intro: "Explore the best tips for coding in React with our latest insights.",
    subject: "fdafda",
    content: "<p>fdafdafd</p>",
    writer: "Mỹ Châu",
    links: [
        'facebook="facebook"',
        'twitter="twitter"',
        'instagram="instagram"',
        'linkedin="linkedin"',
    ],
    tags: ["Unlock", "Tech", "React", "Coding"],
    state: "Unlock",
    createdAt: "2025-03-08T08:05:07.552+00:00",
    updatedAt: "2025-03-08T09:55:38.191+00:00",
    relatedBlogs: [
        {
            img: "https://www.lego.com/cdn/cs/set/assets/bltfd71e7b602a22206/01-Hero-Standard-AdultsWelcome-ArticleAsset-Project-Toot-Desktop.jpg?fit=crop&format=webply&quality=80&width=1600&height=500&dpr=1.5",
            intro: "Explore the best tips for coding in React with our latest insights.",
        },
        {
            img: "https://www.lego.com/cdn/cs/set/assets/bltfd71e7b602a22206/01-Hero-Standard-AdultsWelcome-ArticleAsset-Project-Toot-Desktop.jpg?fit=crop&format=webply&quality=80&width=1600&height=500&dpr=1.5",
            intro: "Unlock the secrets of JavaScript performance optimization.",
        },
        {
            img: "https://www.lego.com/cdn/cs/set/assets/bltfd71e7b602a22206/01-Hero-Standard-AdultsWelcome-ArticleAsset-Project-Toot-Desktop.jpg?fit=crop&format=webply&quality=80&width=1600&height=500&dpr=1.5",
            intro: "Unlock the secrets of JavaScript performance optimization.",
        },
        {
            img: "https://www.lego.com/cdn/cs/set/assets/bltfd71e7b602a22206/01-Hero-Standard-AdultsWelcome-ArticleAsset-Project-Toot-Desktop.jpg?fit=crop&format=webply&quality=80&width=1600&height=500&dpr=1.5",
            intro: "Unlock the secrets of JavaScript performance optimization.",
        },
        {
            img: "https://www.lego.com/cdn/cs/set/assets/bltfd71e7b602a22206/01-Hero-Standard-AdultsWelcome-ArticleAsset-Project-Toot-Desktop.jpg?fit=crop&format=webply&quality=80&width=1600&height=500&dpr=1.5",
            intro: "Unlock the secrets of JavaScript performance optimization.",
        },
        {
            img: "https://www.lego.com/cdn/cs/set/assets/bltfd71e7b602a22206/01-Hero-Standard-AdultsWelcome-ArticleAsset-Project-Toot-Desktop.jpg?fit=crop&format=webply&quality=80&width=1600&height=500&dpr=1.5",
            intro: "Unlock the secrets of JavaScript performance optimization.",
        },
        {
            img: "https://www.lego.com/cdn/cs/set/assets/bltfd71e7b602a22206/01-Hero-Standard-AdultsWelcome-ArticleAsset-Project-Toot-Desktop.jpg?fit=crop&format=webply&quality=80&width=1600&height=500&dpr=1.5",
            intro: "Unlock the secrets of JavaScript performance optimization.",
        },
        {
            img: "https://www.lego.com/cdn/cs/set/assets/bltfd71e7b602a22206/01-Hero-Standard-AdultsWelcome-ArticleAsset-Project-Toot-Desktop.jpg?fit=crop&format=webply&quality=80&width=1600&height=500&dpr=1.5",
            intro: "Unlock the secrets of JavaScript performance optimization.",
        },
    ],
};

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
    const { blogData } = useSelector((state) => state.feedbacks)

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
       dispatch(getBlogDetail());
    }, [blogId, dispatch]);
    return (
        <>
            <img src={blogData?.img} alt="Related blog" className="w-full" />
            <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
                <h1 className="text-3xl font-bold mb-2">{blogData?.subject}</h1>
                <p className="text-gray-500 text-sm">By {blogData?.writer}</p>
                <p className="text-sm text-gray-400">State: {blogData?.state}</p>

                {/* Blog Content */}
                <div
                    className="mt-4 text-gray-700"
                    dangerouslySetInnerHTML={{ __html: blogData?.content }}
                />

                {/* Tags */}
                <div className="mt-4">
                    <p className="font-semibold text-gray-700">Tags:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {blogData?.tags?.map((tag, index) => (
                            <span
                                key={index}
                                className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Social Links */}
                <div className="mt-4">
                    <p className="font-semibold text-gray-700">Follow us on:</p>
                    <div className="flex gap-4 mt-2">
                        {blogData?.links?.map((link, index) => {
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

                {/* Dates */}
                <div className="mt-4 text-gray-500 text-sm">
                    <p>Created at: {formatDate(blogData?.createdAt)}</p>
                </div>

                {/* Related Blogs */}
            </div>
            {/* <div className="my-6 mx-14 items-center">
                <h2 className="text-2xl font-bold text-center">Related Blogs</h2>

                <div className="relative mt-4">
                    {/* Hidden scrollbar & smooth scrolling */}
                    <div
                        ref={scrollRef}
                        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory p-2"
                        style={{
                            scrollBehavior: "smooth",
                            scrollbarWidth: "none", // Hide scrollbar for Firefox
                            msOverflowStyle: "none", // Hide scrollbar for IE/Edge
                        }}
                    >
                        {blogData.relatedBlogs.map((blog, index) => (
                            <div
                                key={index}
                                className="p-4 rounded-lg text-center flex-shrink-0 w-[300px] snap-start"
                            >
                                <img
                                    src={blog.img}
                                    alt={blog.title}
                                    className="w-[300px] h-[200px] object-cover mx-auto"
                                />
                                <h3 className="text-lg font-semibold mt-3">{blog.title}</h3>
                                <p className="mt-2 text-gray-700">{blog.intro}</p>
                                <span className="text-blue-500 cursor-pointer">Read More</span>
                            </div>
                        ))}
                    </div>
                {/* </div> */}

                {/* Custom Position Indicator (Solid Block, No Gradient) */}
                {/* <div className="relative mt-4 h-2 bg-gray-300 rounded-full overflow-hidden">
                    <div
                        className="absolute top-0 h-2 bg-gray-600 rounded-full transition-all duration-200"
                        style={{
                            width: "50px", // Adjust thickness of position indicator
                            left: `${scrollPercentage}%`, // Moves smoothly with scrolling
                            transform: "translateX(-50%)", // Keeps it centered
                        }}
                    ></div>
                </div>
            </div> */}

        </>

    );
};

export default BlogPage;
