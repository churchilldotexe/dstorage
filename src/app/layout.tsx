import ConvexClientProvider from "@/app/ConvexClientProvider";
import Header from "@/app/_components/Header";
import "@/styles/globals.css";
import { Toaster } from "sonner";

import Footer from "@/app/_components/Footer";
import { GeistSans } from "geist/font/sans";

export const metadata = {
   title: "d&apos;Storage",
   description: "an Easy way to manage your files",
   icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
   return (
      <html lang="en" className={`${GeistSans.variable}`}>
         <body>
            <ConvexClientProvider>
               <Toaster closeButton richColors />
               <div className="flex flex-col ">
                  <Header />
                  <div className="h-full">{children}</div>
                  <Footer />
               </div>
            </ConvexClientProvider>
         </body>
      </html>
   );
}
