import StyleDetailClient from "./StyleDetailClient";
import { StyleNewView } from "@/components/modules/styles/style-new-view";
import { styles } from "@/lib/demo-data";

export function generateStaticParams() {
  return [...styles.map((s) => ({ id: s.id })), { id: "new" }];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id === "new") {
    return <StyleNewView basePath="/owner" />;
  }
  return <StyleDetailClient id={id} />;
}

