import { Metadata } from "next";
import NewArrival from "@/components/Home/NewArrivals/index";

export const metadata: Metadata = {
    title: "Shop Page | NextCommerce Nextjs E-commerce template",
    description: "This is Shop Page for NextCommerce Template",
    // other metadata
};

const ShopPage = () => {

    return (
        <main className="md:mx-auto md:max-w-5xl py-10">
            <NewArrival />
        </main>
    );
};

export default ShopPage;
