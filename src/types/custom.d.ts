// Minimal ambient declarations to satisfy TypeScript in the editor/CI.
// Replace with proper package types when available.

declare module "next/server" {
  import * as http from "http";
  import * as React from "react";

  export type NextRequest = any;
  export type NextResponse = any;

  export const NextResponse: {
    json: (...args: any[]) => any;
    redirect: (...args: any[]) => any;
    next: (...args: any[]) => any;
    // index signature for misc helpers
    [key: string]: any;
  };
}

declare module "lucide-react" {
  import * as React from "react";
  export type LucideIconProps = React.SVGProps<SVGSVGElement> & { size?: number | string };
  // Provide permissive icon components for any named export
  export const LucideIcon: React.ComponentType<LucideIconProps>;
  const icons: { [key: string]: React.ComponentType<any> };
  export default icons;
}
