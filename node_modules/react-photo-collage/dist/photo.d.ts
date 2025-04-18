/// <reference types="react" />
interface Props {
    key: string;
    index: number;
    source: string;
    margin: string;
    photosHeight: string;
    onClick: Function;
    numOfRemainingPhotos?: number;
}
declare const Photo: (props: Props) => JSX.Element;
export default Photo;
