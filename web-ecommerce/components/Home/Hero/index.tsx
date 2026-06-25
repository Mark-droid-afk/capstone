import React from "react";
import HeroCarousel from "./HeroCarousel";
import HeroFeature from "./HeroFeature";
import Image from "next/image";

const Hero = () => {
  return (
    <section className="overflow-hidden pb-10 lg:pb-12.5 xl:pb-15 pt-57.5 sm:pt-45 lg:pt-30 xl:pt-51.5 bg-[#E5EAF4]">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="flex flex-wrap gap-5">
          <div className="xl:max-w-[757px] w-full">
            <div className="relative z-1 rounded-[10px] bg-white overflow-hidden">
              {/* <!-- bg shapes --> */}
              <Image
                src="/images/hero/hero-bg.png"
                alt="hero bg shapes"
                className="absolute right-0 bottom-0 -z-1"
                width={534}
                height={520}
              />

              <HeroCarousel />
            </div>
          </div>

          <div className="xl:max-w-[393px] w-full">
            <div className="flex flex-col sm:flex-row xl:flex-col gap-5">
              <div className="w-full relative rounded-[10px] bg-white p-4 sm:p-7.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-col justify-between min-h-[195px] max-w-[140px]">
                    <h2 className="font-semibold text-dark text-xl">
                      <a href="#"> Ube Jam 300g &amp; 500g </a>
                    </h2>

                    <div>
                      <p className="font-medium text-dark-4 text-custom-sm mb-1.5">
                        limited time offer
                      </p>
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-heading-5 text-red whitespace-nowrap">
                          ₱699
                        </span>
                        <span className="font-medium text-2xl text-dark-4 line-through whitespace-nowrap">
                          ₱999
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="relative w-[170px] h-[215px] shrink-0">
                    <Image
                      src="/images/ube/ube3.png"
                      alt="ube jam jar"
                      fill
                      sizes="170px"
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
              <div className="w-full relative rounded-[10px] bg-white p-4 sm:p-7.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-col justify-between min-h-[195px] max-w-[140px]">
                    <h2 className="font-semibold text-dark text-xl">
                      <a href="#"> Ube Jam Tupperware </a>
                    </h2>

                    <div>
                      <p className="font-medium text-dark-4 text-custom-sm mb-1.5">
                        limited time offer
                      </p>
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-heading-5 text-red whitespace-nowrap">
                          ₱699
                        </span>
                        <span className="font-medium text-2xl text-dark-4 line-through whitespace-nowrap">
                          ₱999
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="relative w-[170px] h-[215px] shrink-0">
                    <Image
                      src="/images/ube/ube4.png"
                      alt="ube jam tupperware"
                      fill
                      sizes="170px"
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* <!-- Hero features --> */}
      {/* <HeroFeature /> */}
    </section>
  );
};

export default Hero;