import Image from "next/image";
import { Suspense } from "react";
// Components
import { SignInForm } from "@/components/signIn/signInForm";
import { Footer } from "@/components/home/footer";

export default async function SignIn() {
  return (
    <>
      <section className="flex relative h-[calc(100vh-4.813rem)]">
        <Image
          src="/home-bg.jpg"
          alt="Decorative Background"
          quality={100}
          fill
          className="object-cover -z-10"
          priority
        />
        <Suspense>
          <SignInForm />
        </Suspense>
      </section>
      <Footer />
    </>
  );
}
