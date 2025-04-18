import React from 'react';
interface ReactPhotoCollageContainerProps {
    width?: string;
    height?: Array<string>;
    layout: Array<number>;
    photos: Array<{
        source: string;
    }>;
    showNumOfRemainingPhotos?: boolean;
}
declare const ReactPhotoCollageContainer: React.FC<ReactPhotoCollageContainerProps>;
export default ReactPhotoCollageContainer;
