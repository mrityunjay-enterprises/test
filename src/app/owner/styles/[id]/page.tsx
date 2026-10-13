import StyleDetailClient from "./StyleDetailClient";
import { styles } from "@/lib/demo-data";

export function generateStaticParams() {
  return styles.map((s) => ({ id: s.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <StyleDetailClient id={id} />;
}
