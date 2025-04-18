import React from 'react';
interface StyledComponentProps {
    [key: string]: any;
}
export declare const SC: StyledComponentProps;
interface ReactPhotoCollageComponentProps {
    width: string;
    height: Array<string>;
    layout: Array<number>;
    layoutPhotoMaps: any;
    layoutNum: number;
    remainingNum: number;
    showNumOfRemainingPhotos: boolean;
    openLightbox: any;
}
export declare const ReactPhotoCollageComponent: React.FC<ReactPhotoCollageComponentProps>;
export {};
