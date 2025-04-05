"use client"

import { useEffect, useState } from "react";

export const TypingAnimation = ({ text = "", speed = 100 }) => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (index < text.length) {
            const timeout = setTimeout(() => setIndex(index + 1), speed);
            return () => clearTimeout(timeout);
        }
    }, [index, text, speed]);

    const beforeCaret = text.slice(0, index);

    return (
        <div className="w-3/4 mx-auto p-6">
            <p className="text-4xl font-mono">
                <span className="relative">
                    {beforeCaret}
                    <span className="caret"></span>
                </span>
            </p>

            {/* Global styles for animations */}
            <style>{`
                @keyframes blink {
                    0%, 100% { opacity: 0; }
                    50% { opacity: 1; }
                }

                .caret {
                    display: inline-block;
                    width: 2px;
                    height: 1em; /* This makes it adapt to the text line height */
                    background-color: #ffffff; /* Tailwind gray-800 */
                    animation: blink 0.7s step-end infinite;
                }
            `}</style>
        </div>
    );
};