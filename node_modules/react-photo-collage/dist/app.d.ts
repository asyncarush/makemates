/// <reference types="react" />
interface Props {
    width: string;
    layout: Array<number>;
    photos: Array<{
        src: string;
    }>;
    margin: string;
    photosHeight: Array<string>;
}
declare const PhotoCollage: (props: Props) => JSX.Element;
export default PhotoCollage;
