import Link from "next/link";

export function Footer() {
  return (
    <div className="px-6 sm:px-24 pt-8 pb-12 flex gap-8 justify-between bg-gray-300 font-sans">
      <div className="flex gap-8">
        <div>
          <div>Product</div>
          <div className="flex flex-col gap-2 mt-4 font-medium">
            <Link href="/" className="hover:underline">
              Home
            </Link>
          </div>
        </div>
      </div>
      <div className="flex gap-4 sm:gap-24">
        <div>
          <div>Legal</div>
          <div className="flex flex-col gap-2 mt-4 font-medium">
            <Link href="/terms" className="hover:underline">
              Terms of Use
            </Link>
            <Link href="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
          </div>
        </div>
        <div>
          <div>About the Creators</div>
          <div className="flex flex-col gap-2 mt-4 font-medium">
            <Link
              href="https://www.novaforgood.org/"
              className="hover:underline"
            >
              Nova, Tech for Good
            </Link>
            <Link href="https://risc.uchicago.edu/" className="hover:underline">
              UChicago RISC
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
