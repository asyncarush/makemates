"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReactPhotoCollageComponent = exports.SC = void 0;
var react_1 = __importDefault(require("react"));
var styled_components_1 = __importDefault(require("styled-components"));
exports.SC = {};
exports.SC.PhotoCollage = styled_components_1.default.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n    width: ", ";\n    font-family: Helvetica, Arial, sans-serif;\n"], ["\n    width: ", ";\n    font-family: Helvetica, Arial, sans-serif;\n"])), function (props) { return props.collageWidth; });
exports.SC.PhotoRow = styled_components_1.default.div(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n    display: flex;\n    border: 1px solid #ddd;\n    height: ", ";\n    box-sizing: border-box;\n    & + & {\n        margin-top: 2px;\n    }\n"], ["\n    display: flex;\n    border: 1px solid #ddd;\n    height: ", ";\n    box-sizing: border-box;\n    & + & {\n        margin-top: 2px;\n    }\n"])), function (props) { return props.rowHeight; });
exports.SC.PhotoGrid = styled_components_1.default.div(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n    display: flex;\n    position: relative;\n    flex: 1;\n    cursor: pointer;\n    & + & {\n        margin-left: 2px;\n    }\n"], ["\n    display: flex;\n    position: relative;\n    flex: 1;\n    cursor: pointer;\n    & + & {\n        margin-left: 2px;\n    }\n"])));
exports.SC.PhotoThumb = styled_components_1.default.div(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n    flex: 1;\n    background-image: url(", ");\n    background-position: center;\n    background-size: cover;\n    background-repeat: no-repeat;\n"], ["\n    flex: 1;\n    background-image: url(", ");\n    background-position: center;\n    background-size: cover;\n    background-repeat: no-repeat;\n"])), function (props) { return props.thumb; });
exports.SC.PhotoMask = styled_components_1.default.div(templateObject_5 || (templateObject_5 = __makeTemplateObject(["\n    display: block;\n    background-color: rgba(0, 0, 0, .4);\n    width: 100%;\n    height: 100%;\n    z-index: 1;\n    position: absolute;\n    cursor: pointer;\n"], ["\n    display: block;\n    background-color: rgba(0, 0, 0, .4);\n    width: 100%;\n    height: 100%;\n    z-index: 1;\n    position: absolute;\n    cursor: pointer;\n"])));
exports.SC.NumOfRemaining = styled_components_1.default.div(templateObject_6 || (templateObject_6 = __makeTemplateObject(["\n    position: absolute;\n    color: #fff;\n    font-size: 35px;\n    left: 50%;\n    top: 50%;\n    transform: translate(-50%, -50%);\n    &:before {\n        content: '+';\n    }\n"], ["\n    position: absolute;\n    color: #fff;\n    font-size: 35px;\n    left: 50%;\n    top: 50%;\n    transform: translate(-50%, -50%);\n    &:before {\n        content: '+';\n    }\n"])));
exports.SC.ViewMore = styled_components_1.default.div(templateObject_7 || (templateObject_7 = __makeTemplateObject(["\n    width: 100%; \n    height: 100%; \n    position: absolute; \n    z-index: 1; \n    cursor: pointer;\n"], ["\n    width: 100%; \n    height: 100%; \n    position: absolute; \n    z-index: 1; \n    cursor: pointer;\n"])));
var RowPhotos = function (props) {
    var height = props.height, photos = props.photos, layoutNum = props.layoutNum, remainingNum = props.remainingNum, showNumOfRemainingPhotos = props.showNumOfRemainingPhotos, openLightbox = props.openLightbox;
    return (react_1.default.createElement(exports.SC.PhotoRow, { rowHeight: height }, photos.map(function (data, i) {
        return (react_1.default.createElement(exports.SC.PhotoGrid, { key: i, "data-id": data.id, onClick: function (e) { return openLightbox(e.currentTarget.dataset.id); } },
            showNumOfRemainingPhotos && remainingNum > 0 && data.id === (layoutNum - 1) ?
                (react_1.default.createElement(react_1.default.Fragment, null,
                    react_1.default.createElement(exports.SC.PhotoMask, null),
                    react_1.default.createElement(exports.SC.ViewMore, null,
                        react_1.default.createElement(exports.SC.NumOfRemaining, null, remainingNum)))) : null,
            react_1.default.createElement(exports.SC.PhotoThumb, { thumb: data.source })));
    })));
};
exports.ReactPhotoCollageComponent = react_1.default.memo(function (props) {
    var width = props.width, height = props.height, layout = props.layout, layoutPhotoMaps = props.layoutPhotoMaps, layoutNum = props.layoutNum, remainingNum = props.remainingNum, showNumOfRemainingPhotos = props.showNumOfRemainingPhotos, openLightbox = props.openLightbox;
    return (react_1.default.createElement(exports.SC.PhotoCollage, { collageWidth: width }, layout.map(function (data, i) {
        return (react_1.default.createElement(RowPhotos, { key: i, height: height[i], photos: layoutPhotoMaps[i], openLightbox: openLightbox, layoutNum: layoutNum, remainingNum: remainingNum, showNumOfRemainingPhotos: showNumOfRemainingPhotos }));
    })));
});
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7;
//# sourceMappingURL=react-photo-collage-component.js.map