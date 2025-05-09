import React from 'react';

interface WebViewOverlayProps {
    url: string;
}

export function WebViewOverlay({ url }: WebViewOverlayProps) {
    return (
        <div className="fixed inset-0 bg-[#1F1F1F] z-50">
            <iframe
                src={url}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
        </div>
    );
}
