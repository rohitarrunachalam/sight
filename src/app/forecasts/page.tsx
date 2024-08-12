import React from "react";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function ForeCast() {
  return (
    <div>
      <div className="">
        <Map />
      </div>
    </div>
  );
}
