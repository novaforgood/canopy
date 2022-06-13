import { DropzoneOptions, useDropzone } from "react-dropzone";
import toast from "react-hot-toast";

type HookProps = Omit<DropzoneOptions, "onDropAccepted"> & {
  onDropAccepted: (acceptedFile: File) => void;
};
export function useSingleImageDropzone(props: HookProps) {
  const { onDropAccepted, ...rest } = props;

  const response = useDropzone({
    accept: {
      "image/*": [".jpeg", ".png", ".jpg"],
    },
    maxSize: 2 * 1024 * 1024, // 2MB, max size backend accepts
    onDropAccepted: (files) => {
      onDropAccepted(files[0]);
    },
    onDropRejected: (rejections) => {
      toast.error(rejections[0].errors[0].message);
    },
    onError: (error) => {
      toast.error(error.message);
    },
    maxFiles: 1,
    ...rest,
  });

  return response;
}
