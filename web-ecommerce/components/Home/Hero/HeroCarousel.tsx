"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css/pagination";
import "swiper/css";
import Image from "next/image";

const HeroCarousal = () => {
  return (
    <Swiper
      spaceBetween={30}
      centeredSlides={true}
      autoplay={{
        delay: 2500,
        disableOnInteraction: false,
      }}
      pagination={{
        clickable: true,
      }}
      modules={[Autoplay, Pagination]}
      className="hero-carousel"
    >
      <SwiperSlide>
        <div className="flex items-center pt-6 sm:pt-0 flex-col-reverse sm:flex-row">
          <div className="max-w-[394px] py-10 sm:py-15 lg:py-24.5 pl-4 sm:pl-7.5 lg:pl-12.5">
            <div className="flex items-center gap-4 mb-7.5 sm:mb-10">
              <span className="block font-semibold text-heading-3 sm:text-heading-1 text-blue">
                30%
              </span>
              <span className="block text-dark text-sm sm:text-custom-1 sm:leading-[24px]">
                Sale
                <br />
                Off
              </span>
            </div>

            <h1 className="font-semibold text-dark text-xl sm:text-3xl mb-3">
              <a href="#">Ube Jam (200g)</a>
            </h1>

            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi at ipsum at risus euismod lobortis in
            </p>

            <a href="#" className="inline-flex font-medium text-white text-custom-sm rounded-md bg-dark py-3 px-9 ease-out duration-200 hover:bg-blue mt-10">
              Shop Now
            </a>
          </div>

          <div className="flex-1 relative flex justify-center sm:justify-end items-center pr-4 sm:pr-8 h-[300px] sm:h-[340px] lg:h-[380px]">
            <Image
              src="/images/ube/ube1.png"
              alt="headphone"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </SwiperSlide>

      <SwiperSlide>
        <div className="flex items-center pt-6 sm:pt-0 flex-col-reverse sm:flex-row">
          <div className="max-w-[394px] py-10 sm:py-15 lg:py-26 pl-4 sm:pl-7.5 lg:pl-12.5">
            <div className="flex items-center gap-4 mb-7.5 sm:mb-10">
              <span className="block font-semibold text-heading-3 sm:text-heading-1 text-blue">
                30%
              </span>
              <span className="block text-dark text-sm sm:text-custom-1 sm:leading-[24px]">
                Sale
                <br />
                Off
              </span>
            </div>

            <h1 className="font-semibold text-dark text-xl sm:text-3xl mb-3">
              <a href="#">Ube Jam (300g)</a>
            </h1>

            <p>
              Lorem ipsum dolor sit, consectetur elit nunc suscipit non ipsum nec suscipit.
            </p>

            <a href="#" className="inline-flex font-medium text-white text-custom-sm rounded-md bg-dark py-3 px-9 ease-out duration-200 hover:bg-blue mt-10">
              Shop Now
            </a>
          </div>

          <div className="flex-1 flex justify-center sm:justify-end pr-4 sm:pr-8">
            <Image
              src="/images/ube/ube3.png"
              alt="headphone"
              width={151}
              height={8}
              className="w-[290px] sm:w-[380px] lg:w-[480px] h-auto object-contain"
            />
          </div>
        </div>
      </SwiperSlide>

      
      <SwiperSlide>
        <div className="flex items-center pt-6 sm:pt-0 flex-col-reverse sm:flex-row">
          <div className="max-w-[394px] py-10 sm:py-15 lg:py-26 pl-4 sm:pl-7.5 lg:pl-12.5">
            <div className="flex items-center gap-4 mb-7.5 sm:mb-10">
              <span className="block font-semibold text-heading-3 sm:text-heading-1 text-blue">
                30%
              </span>
              <span className="block text-dark text-sm sm:text-custom-1 sm:leading-[24px]">
                Sale
                <br />
                Off
              </span>
            </div>

            <h1 className="font-semibold text-dark text-xl sm:text-3xl mb-3">
              <a href="#">Ube Halaya (500g)</a>
            </h1>

            <p>
              Lorem ipsum dolor sit, consectetur elit nunc suscipit non ipsum nec suscipit.
            </p>

            <a href="#" className="inline-flex font-medium text-white text-custom-sm rounded-md bg-dark py-3 px-9 ease-out duration-200 hover:bg-blue mt-10">
              Shop Now
            </a>
          </div>

          <div className="flex-1 flex justify-center sm:justify-end pr-4 sm:pr-8">
            <Image
              src="/images/ube/ube2.png"
              alt="headphone"
              width={151}
              height={8}
              className="w-[290px] sm:w-[380px] lg:w-[480px] h-auto object-contain"
            />
          </div>
        </div>
      </SwiperSlide>

      
      <SwiperSlide>
        <div className="flex items-center pt-6 sm:pt-0 flex-col-reverse sm:flex-row">
          <div className="max-w-[394px] py-10 sm:py-15 lg:py-26 pl-4 sm:pl-7.5 lg:pl-12.5">
            <div className="flex items-center gap-4 mb-7.5 sm:mb-10">
              <span className="block font-semibold text-heading-3 sm:text-heading-1 text-blue">
                30%
              </span>
              <span className="block text-dark text-sm sm:text-custom-1 sm:leading-[24px]">
                Sale
                <br />
                Off
              </span>
            </div>

            <h1 className="font-semibold text-dark text-xl sm:text-3xl mb-3">
              <a href="#">Ube Halaya Tupperware</a>
            </h1>

            <p>
              Lorem ipsum dolor sit, consectetur elit nunc suscipit non ipsum nec suscipit.
            </p>

            <a href="#" className="inline-flex font-medium text-white text-custom-sm rounded-md bg-dark py-3 px-9 ease-out duration-200 hover:bg-blue mt-10">
              Shop Now
            </a>
          </div>

          <div className="flex-1 flex justify-center sm:justify-end pr-4 sm:pr-8">
            <Image
              src="/images/ube/ube5.png"
              alt="headphone"
              width={151}
              height={8}
              className="w-[290px] sm:w-[380px] lg:w-[480px] h-auto object-contain"
            />
          </div>
        </div>
      </SwiperSlide>

    </Swiper>
  );
};

export default HeroCarousal;