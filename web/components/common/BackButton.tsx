import { useRouter } from "next/router";

interface BackButtonProps {
  onClick?: () => void;
}

export function BackButton(props: BackButtonProps) {
  const { onClick } = props;
  const router = useRouter();
  return (
    <button onClick={onClick ?? router.back} className="hover:underline">
      {"← Back"}
    </button>
  );
}
