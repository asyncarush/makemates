"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

const RenderMedia = ({ mediaUrls }: { mediaUrls: string[] }) => {
  const [media, setMedia] = useState<string[]>(mediaUrls || []);
  const [showModal, setShowModal] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

  if (!media.length) {
    return null;
  }

  // Function to open modal with specific media index
  const openMediaModal = (index: number) => {
    // console.log("Opening modal for index:", index);
    setSelectedMediaIndex(index);
    setShowModal(true);
  };

  // Function to close modal
  const closeModal = () => {
    // console.log("Closing modal");
    setShowModal(false);
  };

  // Switch based on number of media items
  let mediaDisplay;
  switch (media.length) {
    case 1:
      mediaDisplay = (
        <OneMedia mediaUrl={media[0]} onMediaClick={() => openMediaModal(0)} />
      );
      break;
    case 2:
      mediaDisplay = (
        <TwoMedia mediaUrls={media} onMediaClick={openMediaModal} />
      );
      break;
    case 3:
      mediaDisplay = (
        <ThreeMedia mediaUrls={media} onMediaClick={openMediaModal} />
      );
      break;
    case 4:
      mediaDisplay = (
        <FourMedia mediaUrls={media} onMediaClick={openMediaModal} />
      );
      break;
    default:
      mediaDisplay = (
        <MultipleMedia mediaUrls={media} onMediaClick={openMediaModal} />
      );
      break;
  }

  return (
    <>
      {mediaDisplay}

      {/* Full-screen Modal using Portal */}
      {showModal &&
        typeof window !== "undefined" &&
        createPortal(
          <MediaModal
            mediaUrls={media}
            initialIndex={selectedMediaIndex}
            onClose={closeModal}
          />,
          document.body
        )}
    </>
  );
};

const mediaType = (url: string | null | undefined) => {
  if (!url) return "image";
  const validVideoFiles = ["mp4", "mkv", "webm", "mov"];
  const isVideo = validVideoFiles.some((ext) =>
    url.toLowerCase().endsWith(`.${ext}`)
  );
  return isVideo ? "video" : "image";
};

const OneMedia = ({
  mediaUrl,
  onMediaClick,
}: {
  mediaUrl: string;
  onMediaClick: () => void;
}) => {
  const type = mediaType(mediaUrl);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // e.stopPropagation();
    console.log("OneMedia clicked");
    onMediaClick();
  };

  if (type === "video") {
    return (
      <div
        className="relative w-full max-w-full overflow-hidden bg-black aspect-video cursor-pointer"
        onClick={handleClick}
        style={{ pointerEvents: "auto" }}
      >
        <video
          src={mediaUrl}
          controls
          className="w-full h-full object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden bg-gray-100 w-full max-h-[600px] cursor-pointer"
      onClick={handleClick}
      style={{ pointerEvents: "auto" }}
    >
      <Image
        src={mediaUrl}
        alt="Media content"
        width={500}
        height={500}
        className="w-full h-full object-contain cursor-pointer"
        priority
        onClick={handleClick}
        style={{ pointerEvents: "auto" }}
      />
    </div>
  );
};

// Component for two media items
const TwoMedia = ({
  mediaUrls,
  onMediaClick,
}: {
  mediaUrls: string[];
  onMediaClick: (index: number) => void;
}) => {
  return (
    <div className="grid grid-cols-2 gap-1 h-[400px]">
      <MediaItem
        mediaUrl={mediaUrls[0]}
        className="rounded-l-lg"
        onClick={() => onMediaClick(0)}
      />
      <MediaItem
        mediaUrl={mediaUrls[1]}
        className="rounded-r-lg"
        onClick={() => onMediaClick(1)}
      />
    </div>
  );
};

// Component for three media items
const ThreeMedia = ({
  mediaUrls,
  onMediaClick,
}: {
  mediaUrls: string[];
  onMediaClick: (index: number) => void;
}) => {
  return (
    <div className="grid grid-cols-2 gap-1 h-[400px]">
      <MediaItem
        mediaUrl={mediaUrls[0]}
        className="rounded-l-lg"
        onClick={() => onMediaClick(0)}
      />
      <div className="flex flex-col gap-1">
        <MediaItem
          mediaUrl={mediaUrls[1]}
          className="rounded-tr-lg h-1/2"
          onClick={() => onMediaClick(1)}
        />
        <MediaItem
          mediaUrl={mediaUrls[2]}
          className="rounded-br-lg h-1/2"
          onClick={() => onMediaClick(2)}
        />
      </div>
    </div>
  );
};

// Component for four media items
const FourMedia = ({
  mediaUrls,
  onMediaClick,
}: {
  mediaUrls: string[];
  onMediaClick: (index: number) => void;
}) => {
  return (
    <div className="grid grid-cols-2 gap-1 h-[400px]">
      <div className="flex flex-col gap-1">
        <MediaItem
          mediaUrl={mediaUrls[0]}
          className="rounded-tl-lg h-1/2"
          onClick={() => onMediaClick(0)}
        />
        <MediaItem
          mediaUrl={mediaUrls[1]}
          className="rounded-bl-lg h-1/2"
          onClick={() => onMediaClick(1)}
        />
      </div>
      <div className="flex flex-col gap-1">
        <MediaItem
          mediaUrl={mediaUrls[2]}
          className="rounded-tr-lg h-1/2"
          onClick={() => onMediaClick(2)}
        />
        <MediaItem
          mediaUrl={mediaUrls[3]}
          className="rounded-br-lg h-1/2"
          onClick={() => onMediaClick(3)}
        />
      </div>
    </div>
  );
};

// Component for more than four media items
const MultipleMedia = ({
  mediaUrls,
  onMediaClick,
}: {
  mediaUrls: string[];
  onMediaClick: (index: number) => void;
}) => {
  return (
    <div className="grid grid-cols-2 gap-1 h-[400px]">
      <div className="flex flex-col gap-1">
        <MediaItem
          mediaUrl={mediaUrls[0]}
          className="rounded-tl-lg h-1/2"
          onClick={() => onMediaClick(0)}
        />
        <MediaItem
          mediaUrl={mediaUrls[1]}
          className="rounded-bl-lg h-1/2"
          onClick={() => onMediaClick(1)}
        />
      </div>
      <div className="flex flex-col gap-1">
        <MediaItem
          mediaUrl={mediaUrls[2]}
          className="rounded-tr-lg h-1/2"
          onClick={() => onMediaClick(2)}
        />
        <div
          className="relative rounded-br-lg h-1/2 bg-gray-100 cursor-pointer"
          onClick={() => onMediaClick(3)}
        >
          <MediaItem
            mediaUrl={mediaUrls[3]}
            className="h-full w-full"
            onClick={() => onMediaClick(3)}
          />
          {mediaUrls.length > 4 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 text-white font-bold text-xl rounded-br-lg">
              +{mediaUrls.length - 4} more
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Common MediaItem component
const MediaItem = ({
  mediaUrl,
  className = "",
  onClick,
}: {
  mediaUrl: string;
  className?: string;
  onClick?: () => void;
}) => {
  const type = mediaType(mediaUrl);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick && onClick();
  };

  if (type === "video") {
    return (
      <div
        className={`relative overflow-hidden bg-black ${className} ${
          onClick ? "cursor-pointer" : ""
        }`}
        onClick={handleClick}
      >
        <video
          src={mediaUrl}
          className="w-full h-full object-cover"
          poster="/api/placeholder/400/300"
          onClick={(e) => e.stopPropagation()}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="p-3 bg-black bg-opacity-50 rounded-full">
            <svg
              className="w-6 h-6 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden bg-gray-100 ${className} ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={handleClick}
    >
      <Image
        src={mediaUrl}
        alt="Media content"
        fill
        className="object-cover cursor-pointer"
        sizes="(max-width: 768px) 100vw, 50vw"
        onClick={handleClick}
      />
    </div>
  );
};

// Modal component for full-screen media view
const MediaModal = ({
  mediaUrls,
  initialIndex,
  onClose,
}: {
  mediaUrls: string[];
  initialIndex: number;
  onClose: () => void;
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const type = mediaType(mediaUrls[currentIndex]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) =>
          prev === 0 ? mediaUrls.length - 1 : prev - 1
        );
      } else if (e.key === "ArrowRight") {
        setCurrentIndex((prev) =>
          prev === mediaUrls.length - 1 ? 0 : prev + 1
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Prevent scrolling while modal is open and ensure body positioning
    document.body.style.overflow = "hidden";
    document.body.style.position = "relative";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      document.body.style.position = "";
    };
  }, [onClose, mediaUrls.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? mediaUrls.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === mediaUrls.length - 1 ? 0 : prev + 1));
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black bg-opacity-95 flex flex-col items-center justify-center"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Close button */}
      <button
        className="absolute top-4 right-4 p-2 text-white bg-black bg-opacity-50 rounded-full z-10 hover:bg-opacity-70 transition-all duration-200"
        onClick={onClose}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Navigation buttons (only show if more than 1 media) */}
      {mediaUrls.length > 1 && (
        <>
          <button
            className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 text-white bg-black bg-opacity-50 rounded-full z-10 hover:bg-opacity-70 transition-all duration-200"
            onClick={goToPrevious}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 text-white bg-black bg-opacity-50 rounded-full z-10 hover:bg-opacity-70 transition-all duration-200"
            onClick={goToNext}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}

      {/* Media content container */}
      <div
        className="w-full h-full flex items-center justify-center p-4"
        style={{
          maxWidth: "100vw",
          maxHeight: "100vh",
          boxSizing: "border-box",
        }}
      >
        {type === "video" ? (
          <video
            src={mediaUrls[currentIndex]}
            controls
            autoPlay
            className="max-w-full max-h-full object-contain"
            style={{
              width: "auto",
              height: "auto",
              maxWidth: "calc(100vw - 2rem)",
              maxHeight: "calc(100vh - 2rem)",
            }}
          />
        ) : (
          <div
            className="relative flex items-center justify-center"
            style={{
              width: "100%",
              height: "100%",
              maxWidth: "calc(100vw - 2rem)",
              maxHeight: "calc(100vh - 2rem)",
            }}
          >
            <Image
              src={mediaUrls[currentIndex]}
              alt="Media content"
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>
        )}
      </div>

      {/* Media counter */}
      {mediaUrls.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 px-4 py-2 rounded-full text-white">
          {currentIndex + 1} / {mediaUrls.length}
        </div>
      )}
    </div>
  );
};

export default RenderMedia;
