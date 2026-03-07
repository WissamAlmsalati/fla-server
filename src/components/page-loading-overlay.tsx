"use client";

import { useEffect, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function LoadingBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [prevPath, setPrevPath] = useState<string | null>(null);

  useEffect(() => {
    const current = pathname + searchParams.toString();

    if (prevPath !== null && prevPath !== current) {
      setLoading(true);
      setProgress(20);

      const t1 = setTimeout(() => setProgress(60), 100);
      const t2 = setTimeout(() => setProgress(85), 250);
      const t3 = setTimeout(() => {
        setProgress(100);
        setTimeout(() => {
          setLoading(false);
          setProgress(0);
        }, 200);
      }, 450);

      setPrevPath(current);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }

    setPrevPath(current);
  }, [pathname, searchParams]);

  return (
    <>
      {/* Top progress bar */}
      <div
        className="fixed top-0 left-0 z-[9999] h-[3px] bg-primary transition-all duration-300 ease-out shadow-[0_0_8px] shadow-primary/60"
        style={{ width: `${progress}%`, opacity: loading || progress > 0 ? 1 : 0 }}
      />
      {/* Subtle content overlay */}
      {loading && (
        <div className="absolute inset-0 z-[998] bg-background/30 backdrop-blur-[1px] pointer-events-none animate-in fade-in duration-150" />
      )}
    </>
  );
}

export function PageLoadingOverlay() {
  return (
    <Suspense fallback={null}>
      <LoadingBar />
    </Suspense>
  );
}
