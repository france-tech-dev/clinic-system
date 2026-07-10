import { SiteHeader } from "@/components/templates/SiteHeader/site-header";

export default function Page() {
  return (
    <>
      <SiteHeader title="WhatsApp" />
      <div className="flex-1 justify-center items-center flex">
        <h1 className="text-4xl font-bold capitalize">
          Automação para envio de mensagens no WhatsApp
        </h1>
      </div>
    </>
  );
}
