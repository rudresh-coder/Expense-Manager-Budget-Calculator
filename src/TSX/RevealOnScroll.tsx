import React, { useRef , useEffect, useState } from "react";
import type { ReactNode } from "react";

export default function RevealOnScroll({
    children,
    className = "",
    style = {},
    as: Tag = "div",
    ...props
}: {
    children: ReactNode;
    className?: string;
    style?: React.CSSProperties;
    as?: React.ElementType;
    [key: string]: unknown;
}) {
    const ref = useRef<HTMLElement | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;
        const observer = new window.IntersectionObserver(
        ([entry]) => {
            if (entry.isIntersecting) setVisible(true);
        },
        { threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
    }, []);

    return (
        <Tag
            ref={ref as React.Ref<HTMLElement>}
            className={`${className} ${visible ? "reveal-visible" : "reveal-hidden"}`}
            style={style}
            {...props}>
                {children}
        </Tag>
    );
}