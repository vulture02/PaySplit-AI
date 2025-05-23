"use client";

import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import React from "react";
import { useStoreUser } from "@/hooks/use-store-user";
import { BarLoader } from "react-spinners";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { LayoutDashboard } from "lucide-react";
import { Authenticated, Unauthenticated } from "convex/react";




const Header = () => {

  const { isLoading } = useStoreUser();
  const path = usePathname();


  return (
    <header className="fixed top-0 w-full border-b bg-white/95 backdrop-blur z-50 supports-[backdrop-filter]:bg-white/60">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2">
          <Image
            src={"/logos/Splendz_Logo.png"}
            alt="Splendz Logo"
            width={200}
            height={60}
            className="h-11 w-auto object-contain"
          />
        </Link>

        {path === "/" && (
          <div className="hidden md:flex items-center gap-6">
            <Link href="#specifications"
              className="text-sm font-medium hover:text-blue-600 transition"
            > Specs </Link>
            <Link href="#how-it-helps"
              className="text-sm font-medium hover:text-blue-600 transition"
            > How It Helps </Link>
          </div>
        )}

        <div className="flex items-center gap-4">
        <Authenticated>
            <Link href="/dashboard">
              <Button
                variant="outline"
                className="hidden md:inline-flex items-center gap-2 hover:text-blue-600 hover:border-blue-600 transition"
              >
                <LayoutDashboard className="h-4 w-4" />
                Hub
              </Button>
              <Button variant="ghost" className="md:hidden w-10 h-10 p-0">
                <LayoutDashboard className="h-4 w-4" />
              </Button>
            </Link>

            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                  userButtonPopoverCard: "shadow-xl",
                  userPreviewMainIdentifier: "font-semibold",
                },
              }}
              afterSignOutUrl="/"
            />
          </Authenticated>

          <Unauthenticated>
            <SignInButton>
              <Button variant="ghost">Sign In</Button>
            </SignInButton>

            <SignUpButton>
              <Button className="bg-blue-600 hover:bg-blue-700 border-none">
                Start Exploring
              </Button>
            </SignUpButton>
          </Unauthenticated>

        </div>


      </nav>
      {isLoading && <BarLoader width={"100%"} color="#ADD8E6" />}
    </header>
  );
};

export default Header;
