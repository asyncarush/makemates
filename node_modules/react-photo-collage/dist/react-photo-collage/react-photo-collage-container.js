"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var react_images_1 = __importStar(require("react-images"));
var react_photo_collage_component_1 = require("./react-photo-collage-component");
var createPhotoIds = function (photos) {
    return photos.map(function (data, i) {
        return __assign(__assign({}, data), { id: i });
    });
};
var createLayoutPhotoMaps = function (layout, photos) {
    var newPhotos = createPhotoIds(photos);
    var newMaps = {};
    layout.reduce(function (accumulator, currentValue, currentIndex) {
        newMaps[currentIndex] = newPhotos.slice(accumulator, accumulator + currentValue);
        return accumulator + currentValue;
    }, 0);
    return newMaps;
};
var checkProps = function (props) {
    var defaultProps = {
        width: '800px',
        height: new Array(props.layout.length),
        layout: [],
        photos: [],
        showNumOfRemainingPhotos: false
    };
    var newProps = __assign(__assign({}, defaultProps), props);
    if (newProps.height.length < newProps.layout.length) {
        for (var i = 0; i < newProps.layout.length; i++) {
            newProps.height[i] = '200px';
        }
    }
    return newProps;
};
var ReactPhotoCollageContainer = function (props) {
    var currProps = react_1.useMemo(function () { return checkProps(props); }, [props]);
    var width = currProps.width, height = currProps.height, layout = currProps.layout, photos = currProps.photos, showNumOfRemainingPhotos = currProps.showNumOfRemainingPhotos;
    var layoutNum = layout.reduce(function (accumulator, currentValue) { return accumulator + currentValue; }, 0);
    var remainingNum = photos.length - layoutNum;
    var _a = react_1.useState(false), allowRender = _a[0], setAllowRender = _a[1];
    var _b = react_1.useState({}), layoutPhotoMaps = _b[0], setLayoutPhotoMaps = _b[1];
    var _c = react_1.useState(false), viewerIsOpen = _c[0], setViewerIsOpen = _c[1];
    var _d = react_1.useState(0), currentImage = _d[0], setCurrentImage = _d[1];
    react_1.useEffect(function () {
        setLayoutPhotoMaps(createLayoutPhotoMaps(layout, photos));
    }, []);
    react_1.useEffect(function () {
        Object.keys(layoutPhotoMaps).length ? setAllowRender(true) : setAllowRender(false);
    }, [layoutPhotoMaps]);
    var openLightbox = react_1.useCallback(function (id) {
        setCurrentImage(parseInt(id));
        setViewerIsOpen(true);
    }, []);
    var closeLightbox = react_1.useCallback(function () {
        setCurrentImage(0);
        setViewerIsOpen(false);
    }, []);
    if (allowRender) {
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(react_photo_collage_component_1.ReactPhotoCollageComponent, { width: width, height: height, layout: layout, layoutPhotoMaps: layoutPhotoMaps, layoutNum: layoutNum, remainingNum: remainingNum, showNumOfRemainingPhotos: showNumOfRemainingPhotos, openLightbox: openLightbox }),
            react_1.default.createElement(react_images_1.ModalGateway, null, viewerIsOpen ?
                (react_1.default.createElement(react_images_1.Modal, { onClose: closeLightbox },
                    react_1.default.createElement(react_images_1.default, { views: photos, currentIndex: currentImage }))) : null)));
    }
    return null;
};
exports.default = ReactPhotoCollageContainer;
//# sourceMappingURL=react-photo-collage-container.js.map