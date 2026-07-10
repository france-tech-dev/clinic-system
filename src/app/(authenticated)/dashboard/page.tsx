import { SiteHeader } from "@/components/templates/SiteHeader/site-header";

export default function Page() {
  return (
    <>
      <SiteHeader title="Dashboard" />
      <div className="flex-1 justify-center items-center flex">
        <h1 className="text-5xl font-bold capitalize">Dashboard</h1>
      </div>
    </>
  );
}
