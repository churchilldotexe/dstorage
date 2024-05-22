import "@/styles/globals.css";

import SideNav from "@/app/dashboard/side-nav";

export default function RootLayout({ children }: { children: React.ReactNode }) {
   return (
      <main className="flex">
         <SideNav />
         {children}
      </main>
   );
}
