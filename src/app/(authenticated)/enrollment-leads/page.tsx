"use client";

import { SiteHeader } from "@/components/templates/SiteHeader/site-header";

import { EnrollmentTable } from "./enrollment-table/enrollment-table";

export default function Page() {
  return (
    <>
      <SiteHeader title="Register Leads" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 p-4 md:gap-6 md:y-6">
            <EnrollmentTable />
          </div>
        </div>
      </div>
    </>
  );
}
