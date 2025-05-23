"use client";

import {
  SignInButton,
  SignUpButton,
  UserButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import React from "react";
import { useStoreUser } from "@/hooks/use-store-user";
import { BarLoader } from "react-spinners";




const Header = () => {

  const { isLoading } = useStoreUser();
  


  return (
    <header className="fixed top-0 w-full border-b bg-white/95 backdrop-blur z-50 supports-[backdrop-filter]:bg-white/60">
      <nav>
        <SignedOut>
          <SignInButton />
          <SignUpButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </nav>
      {isLoading && <BarLoader width={"100%"} color="#ADD8E6" />}
    </header>
  );
};

export default Header;
