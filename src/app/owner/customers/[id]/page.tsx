import BuyerProfileClient from "./BuyerProfileClient";
import { buyers } from "@/lib/demo-data";

export function generateStaticParams() {
  return buyers.map((b) => ({ id: b.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BuyerProfileClient id={id} />;
}
