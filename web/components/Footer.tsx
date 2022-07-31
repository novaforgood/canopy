import Link from "next/link";

import { Text } from "../components/atomic";

export function Footer() {
  return (
    <div>
      <div className="border-t-2 border-gray-700 px-6 sm:px-24 pt-8 pb-12 flex gap-8 justify-between bg-green-700 text-gray-100 font-sans text-sm">
        <div className="flex gap-4">
          <img
            src="/assets/canopy_logo_square.svg"
            alt="logo"
            className="h-10 w-10"
          />
          <Text className="sm:max-w-lg" mobileVariant="body2">
            Canopy’s mission is to support the growth of more connected
            communities by helping people find each other more seamlessly.
          </Text>
        </div>
      </div>
      <div className="border-t-2 border-gray-700 px-6 sm:px-24 pt-8 pb-12 flex gap-8 justify-between bg-green-700 text-gray-100 font-sans text-sm">
        <div className="flex gap-8">
          <div>
            <div>Canopy</div>
            <div className="flex flex-col gap-2 mt-4 font-medium">
              <a target="_blank" className="hover:underline" href="/">
                Home
              </a>
            </div>
          </div>
        </div>
        <div className="flex gap-4 sm:gap-24">
          <div>
            <div>Legal</div>
            <div className="flex flex-col gap-2 mt-4 font-medium">
              <a target="_blank" className="hover:underline" href="/terms">
                Terms of Use
              </a>

              <a target="_blank" className="hover:underline" href="/privacy">
                Privacy Policy
              </a>
            </div>
          </div>
          <div>
            <div>About the Creators</div>
            <div className="flex flex-col gap-2 mt-4 font-medium">
              <a
                target="_blank"
                className="hover:underline"
                href="https://www.novaforgood.org/"
                rel="noreferrer"
              >
                Nova, Tech for Good
              </a>

              <a
                target="_blank"
                className="hover:underline"
                href="https://risc.uchicago.edu/"
                rel="noreferrer"
              >
                UChicago RISC
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}