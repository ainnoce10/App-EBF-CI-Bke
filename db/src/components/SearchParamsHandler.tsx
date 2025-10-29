"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SearchParamsHandlerContent({ 
  onContactParam 
}: { 
  onContactParam: (hasContact: boolean) => void 
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const contactParam = searchParams.get('contact');
    onContactParam(contactParam === 'true');
  }, [searchParams, onContactParam]);

  return null;
}

export default function SearchParamsHandler({ 
  onContactParam 
}: { 
  onContactParam: (hasContact: boolean) => void 
}) {
  return (
    <Suspense fallback={null}>
      <SearchParamsHandlerContent onContactParam={onContactParam} />
    </Suspense>
  );
}