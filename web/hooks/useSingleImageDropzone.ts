import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";

interface HookProps {
  onDropAccepted: (acceptedFiles: File) => void;
  disabled?: boolean;
}

export function useSingleImageDropzone(props: HookProps) {
  const { onDropAccepted, disabled = false } = props;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [".jpeg", ".png", ".jpg"],
    },
    maxSize: 2 * 1024 * 1024, // 2MB, max size backend accepts
    disabled,
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
  });

  return {
    getRootProps,
    getInputProps,
    isDragActive,
  };
}
