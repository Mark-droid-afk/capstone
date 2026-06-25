import { notFound } from "next/navigation";
import shopData from "@/components/Shop/shopData";
import { ProductDetail } from "@/components/Product";
import FeedbackSection from "@/components/Product/FeedbackSection";
import { Feedback } from "@/components/Product/types";
import Breadcrumb from "@/components/Common/Breadcrumb";
import QuickViewModal from "@/components/Common/QuickViewModal";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  const product = shopData.find((p) => p.id === id);
  if (!product) notFound();

  const feedbacks: Feedback[] = []; //  ← just an empty array, no mock data

  const mappedProduct = {
    id: String(product.id),
    name: product.title,
    price: product.discountedPrice,
    originalPrice: product.price,
    image: product.imgs?.previews?.[0] ?? "",
    category: "Electronics",
    description: `Experience the ${product.title} — a top-rated product trusted by ${product.reviews} customers.`,
    feedbacks,
  };

  return (
    <main>
      <Breadcrumb title={product.title} pages={["shop", "/", product.title]} />
      <section className="overflow-hidden relative pb-20 pt-5 lg:pt-20 bg-[#f3f4f6]">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="bg-white rounded-lg shadow-1 p-6 lg:p-10">
            <ProductDetail product={mappedProduct} />
            <QuickViewModal />
            <hr className="my-10 border-gray-200" />
            <FeedbackSection initialFeedbacks={feedbacks} />
          </div>
        </div>
      </section>
    </main>
  );
}