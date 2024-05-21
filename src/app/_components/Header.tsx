import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";

export default function Header() {
   return (
      <div className="border-b bg-gray-50 py-4">
         <div className="container mx-auto flex items-center justify-between">
            oh hi
            <div className="space-x-4">
               <OrganizationSwitcher />
               <UserButton />
            </div>
         </div>
      </div>
   );
}
