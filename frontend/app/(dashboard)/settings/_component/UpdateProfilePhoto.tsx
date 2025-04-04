import { Button } from "@/components/ui/button";
import React, { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import FileInput from "./FileInput";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import Cropper from "react-easy-crop";

import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";

import { app } from "@/firebase";
import axios from "axios";
import { Progress } from "@/components/ui/progress";
import toast from "react-hot-toast";
import Compressor from "compressorjs";
import { API_ENDPOINT } from "@/axios.config";
import { AuthContext } from "@/app/context/AuthContext";

function UpdateProfilePhoto({ value }: { value: string }) {
  const { currentUser, setCurrentUser }: any = useContext(AuthContext);

  const [image, setImage] = useState<any>("");
  const [currentPage, setCurrentPage] = useState("choose-img");
  const [imgAfterCrop, setImgAfterCrop] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState(null);
  const [aspectRatio, setAspectRatio] = useState(3 / 3);
  const [uploadState, setUploadState] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const router = useRouter();

  // Invoked when new image file is selected
  const onImageSelected = (selectedImg: any) => {
    setImage(selectedImg);
    setCurrentPage("crop-img");
  };

  // Generating Cropped Image When Done Button Clicked
  const onCropDone = (imgCroppedArea: any) => {
    const canvasEle = document.createElement("canvas");
    canvasEle.width = imgCroppedArea.width;
    canvasEle.height = imgCroppedArea.height;

    const context: any = canvasEle.getContext("2d");

    let imageObj1 = new Image();
    imageObj1.src = image;
    imageObj1.onload = function () {
      context.drawImage(
        imageObj1,
        imgCroppedArea.x,
        imgCroppedArea.y,
        imgCroppedArea.width,
        imgCroppedArea.height,
        0,
        0,
        imgCroppedArea.width,
        imgCroppedArea.height
      );

      const dataURL = canvasEle.toDataURL("image/jpeg");

      setImgAfterCrop(dataURL);
      setCurrentPage("img-cropped");
    };
  };

  // Handle Cancel Button Click
  const onCropCancel = () => {
    setCurrentPage("choose-img");
    setImage("");
  };

  const onCropComplete = (
    croppedAreaPercentage: any,
    croppedAreaPixels: any
  ) => {
    setCroppedArea(croppedAreaPixels);
  };

  const uploadProfilePicture = async () => {
    const res = await fetch(imgAfterCrop);
    const blob = await res.blob();

    let formData = new FormData();

    new Compressor(blob, {
      quality: 0.6,
      async success(result: any) {
        const fileExtension = result.type.split("/")[1] || "jpg";
        const fileName = `profile_pic_${Date.now()}-${
          currentUser.name
        }.${fileExtension}`;

        formData.append("profile_image", result, fileName);

        try {
          setUploadState(true);
          const uploadResponse: any = await axios.post(
            `${API_ENDPOINT}/upload/profileImage`,
            formData,
            {
              withCredentials: true,
              headers: {
                "Content-Type": "multipart/form-data",
              },
              onUploadProgress: (progressEvent) => {
                const progress = progressEvent.total
                  ? Math.round(
                      (progressEvent.loaded * 100) / progressEvent.total
                    )
                  : 0;
                setUploadProgress(progress);
              },
            }
          );

          const imageUrl = uploadResponse.data.url;

          await axios.post(
            `${API_ENDPOINT}/user/setProfilePic`,
            {
              profileImgUrl: imageUrl,
            },
            { withCredentials: true }
          );

          // Update the currentUser in context and localStorage
          const updatedUser = {
            ...currentUser,
            img: imageUrl,
          };
          setCurrentUser(updatedUser);
          window.localStorage.setItem(
            "currentUser",
            JSON.stringify(updatedUser)
          );

          toast.success("Profile Image Successfully Updated.");
          onCropCancel();
          setIsOpen(false);
          router.refresh();

          // Clear states
          setUploadState(false);
          setUploadProgress(null);
        } catch (error: any) {
          setUploadState(false);
          setUploadProgress(null);
          toast.error("Failed to upload image: " + error.message);
        }
      },
      error(err) {
        toast.error(err.message);
      },
    });
  };

  return (
    <div className="flex flex-col">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" onClick={() => setIsOpen(true)}>
            Change Photo
          </Button>
        </DialogTrigger>
        <DialogContent className="w-auto">
          <DialogHeader>
            <DialogTitle>Change Profile Photo</DialogTitle>
            <DialogDescription>
              Crop your image then click on save button
            </DialogDescription>
          </DialogHeader>
          <div className="">
            {currentPage == "choose-img" && (
              <div>
                <FileInput onImageSelected={onImageSelected} />
              </div>
            )}

            {currentPage == "crop-img" && (
              <div className="border-2  border-red-500 flex items-center justify-center">
                <Cropper
                  image={image}
                  aspect={aspectRatio}
                  crop={crop}
                  zoom={zoom}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  style={{
                    containerStyle: {
                      position: "relative",
                      width: "400px",
                      height: "300px",
                      backgroundColor: "#fff",
                    },
                  }}
                />
              </div>
            )}

            {currentPage == "img-cropped" && (
              <div className="flex items-center justify-center">
                <img
                  src={imgAfterCrop}
                  className="cropped-img"
                  width="200"
                  alt="Cropped Image"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            {currentPage == "img-cropped" && (
              <div className="flex gap-2">
                <Button
                  variant={"default"}
                  onClick={() => {
                    setCurrentPage("crop-img");
                  }}
                  className="btn"
                >
                  Edit Crop
                </Button>

                <Button
                  variant={"default"}
                  onClick={() => {
                    setCurrentPage("choose-img");
                    setImage("");
                  }}
                  className="btn"
                >
                  New Image
                </Button>

                <Button
                  variant={"default"}
                  onClick={uploadProfilePicture}
                  className="btn"
                >
                  Set Profile Picture
                </Button>
              </div>
            )}

            {currentPage == "crop-img" && (
              <div className="flex gap-2">
                <Button
                  variant={"default"}
                  className="btn"
                  onClick={() => {
                    onCropDone(croppedArea);
                  }}
                >
                  Crop
                </Button>
                <Button
                  variant={"destructive"}
                  size={"sm"}
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </DialogFooter>
          <div className="w-full flex flex-col justify-center">
            {uploadState && (
              <span className="text-center font-medium">
                Post is Uploading...
              </span>
            )}
            {uploadState && (
              <div className="flex items-center gap-1">
                <Progress value={uploadProgress} />
                <span className="font-semibold text-sm">{uploadProgress}%</span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default UpdateProfilePhoto;
