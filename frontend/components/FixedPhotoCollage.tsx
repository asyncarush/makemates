import React, { forwardRef } from "react";
import dynamic from "next/dynamic";

// Import the actual component
const ReactPhotoCollageOriginal = dynamic(
  () => import("react-photo-collage").then((mod) => mod.ReactPhotoCollage),
  { ssr: false }
);

// Define the props interface
interface PhotoCollageProps {
  width: string;
  height: string[];
  layout: number[];
  photos: { source: string }[];
  showNumOfRemainingPhotos: boolean;
}

// Create a fixed version that properly sanitizes props before passing to DOM
const FixedPhotoCollage = forwardRef<HTMLDivElement, PhotoCollageProps>(
  (props, ref) => {
    // Only pass the props that the library expects
    const sanitizedProps = {
      width: props.width,
      height: props.height,
      layout: props.layout,
      photos: props.photos,
      showNumOfRemainingPhotos: props.showNumOfRemainingPhotos,
    };

    return (
      <div ref={ref} className="photo-collage-wrapper">
        <ReactPhotoCollageOriginal {...sanitizedProps} />
      </div>
    );
  }
);

FixedPhotoCollage.displayName = "FixedPhotoCollage";

export default FixedPhotoCollage;
