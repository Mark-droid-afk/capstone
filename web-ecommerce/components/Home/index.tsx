"use client";

import React, { useEffect } from "react";
import Hero from "./Hero";
import Categories from "./Categories";
import NewArrival from "./NewArrivals";
import PromoBanner from "./PromoBanner";
import BestSeller from "./BestSeller";
import Testimonials from "./Testimonials";
import Newsletter from "../Common/Newsletter";
import CountDown from "./Countdown";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const Home = () => {
  // const { user, isLoading } = useAuth();
  // const router = useRouter();

  // useEffect(() => {
  //   if (!isLoading && !user) {
  //     router.replace("/signin");
  //   }
  // }, [user, isLoading]);

  // if (isLoading) return <div>Loading...</div>;
  // if (!user) return null;

  return (
    <main>
      <Hero />
      {/* <Categories /> */}
      <NewArrival />
      <PromoBanner />
      {/* <BestSeller /> */}
      <CountDown />
      <Testimonials />
      <Newsletter />
    </main>
  );
};

export default Home;
