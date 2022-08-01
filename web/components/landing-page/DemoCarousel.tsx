import React from "react";

import { A11y, Navigation, Pagination } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/navigation";

const CAROUSEL_IMAGES = [
  "carousel_1.png",
  "carousel_2.png",
  "carousel_3.png",
  "carousel_4.png",
];

export function DemoCarousel() {
  return (
    <div className="w-full">
      <div>
        <Swiper
          modules={[Navigation, Pagination, A11y]}
          spaceBetween={50}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
        >
          {CAROUSEL_IMAGES.map((image, index) => (
            <SwiperSlide
              key={index}
              className="flex justify-center select-none"
            >
              <div className="px-12 pt-10 sm:pt-0 sm:px-16 pb-8">
                <div className="rounded-md border border-green-700 overflow-hidden">
                  <div className="h-10 border-b border-green-700 flex items-end gap-2 pb-2 pl-4">
                    <div className="rounded-full shrink-0 h-5 w-5 border border-green-700"></div>
                    <div className="rounded-full shrink-0 h-5 w-5 border border-green-700"></div>
                    <div className="rounded-full shrink-0 h-5 w-5 border border-green-700"></div>
                  </div>
                  <img
                    src={`/assets/landing/carousel/${image}`}
                    alt="Product demo"
                  />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
