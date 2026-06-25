import React from "react";
import Image from "next/image";

const PromoBanner = () => {
  return (
    <section className="overflow-hidden py-20">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {/* <!-- promo banner big --> */}
        <div className="relative z-1 overflow-hidden rounded-lg bg-[#F5F5F7] py-12.5 lg:py-17.5 xl:py-22.5 px-4 sm:px-7.5 lg:px-14 xl:px-19 mb-7.5">
          <div className="flex items-center justify-between gap-6">
            <div className="max-w-[550px] w-full">
              <span className="block font-medium text-xl text-dark mb-3">
                Bren Raphael Ube Jam
              </span>

              <h2 className="font-bold text-xl lg:text-heading-4 xl:text-heading-3 text-dark mb-5">
                UP TO 30% OFF
              </h2>

              <p className="max-w-[440px] text-custom-sm text-dark-4 leading-[24px]">
                Made from real purple yam, our Ube Jam is slow-cooked to a
                rich, creamy texture with tidbits in every jar &mdash; the
                authentic taste of homemade halaya.
              </p>

              <a
                href="#"
                className="inline-flex font-medium text-custom-sm text-white bg-blue py-[11px] px-9.5 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5"
              >
                Buy Now
              </a>
            </div>

            <div className="relative w-[160px] h-[200px] sm:w-[260px] sm:h-[320px] lg:w-[320px] lg:h-[380px] shrink-0">
              <Image
                src="/images/ube/ube2.png"
                alt="promo img"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-7.5 grid-cols-1 lg:grid-cols-2">
          {/* <!-- promo banner small --> */}
          <div className="relative z-1 overflow-hidden rounded-lg bg-[#DBF4F3] py-10 xl:py-16 px-4 sm:px-7.5 xl:px-10">
            <div className="flex items-center justify-between gap-4">
              <div className="relative w-[160px] h-[200px] sm:w-[200px] sm:h-[250px] shrink-0">
                <Image
                  src="/images/ube/ube5.png"
                  alt="promo img"
                  fill
                  className="object-contain"
                />
              </div>

              <div className="flex-1">
                <span className="block text-lg text-dark mb-1.5">
                  Ube Jam Tupperware Pack
                </span>

                <h2 className="font-bold text-xl lg:text-heading-4 text-dark mb-2.5">
                  Family Size Tub
                </h2>

                <p className="font-semibold text-custom-1 text-teal">
                  Flat 20% off
                </p>

                <a
                  href="#"
                  className="inline-flex font-medium text-custom-sm text-white bg-teal py-2.5 px-8.5 rounded-md ease-out duration-200 hover:bg-teal-dark mt-9"
                >
                  Grab Now
                </a>
              </div>
            </div>
          </div>

          {/* <!-- promo banner small --> */}
          <div className="relative z-1 overflow-hidden rounded-lg bg-[#FFECE1] py-10 xl:py-16 px-4 sm:px-7.5 xl:px-10">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <span className="block text-lg text-dark mb-1.5">
                  Ube Jam 500g Jar
                </span>

                <h2 className="font-bold text-xl lg:text-heading-4 text-dark mb-2.5">
                  Up to <span className="text-orange">40%</span> off
                </h2>

                <p className="max-w-[285px] text-custom-sm text-dark-4 leading-[24px]">
                  Our biggest jar yet &mdash; rich purple yam jam with
                  tidbits, perfect for sharing or stocking up.
                </p>

                <a
                  href="#"
                  className="inline-flex font-medium text-custom-sm text-white bg-orange py-2.5 px-8.5 rounded-md ease-out duration-200 hover:bg-orange-dark mt-7.5"
                >
                  Buy Now
                </a>
              </div>

              <div className="relative w-[160px] h-[200px] sm:w-[200px] sm:h-[250px] shrink-0">
                <Image
                  src="/images/ube/ube2.png"
                  alt="promo img"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;