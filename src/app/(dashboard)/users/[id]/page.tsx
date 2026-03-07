import { UserDetail } from "@/features/users/components/UserDetail";
import { Suspense } from "react";




export default async function UserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
              <Suspense fallback={null}><UserDetail userId={parseInt(id)} /></Suspense>
            </div>
          </div>
        </div>
        </>
  );
}
