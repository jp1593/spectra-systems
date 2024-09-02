import Image from "next/image";
import { Suspense } from "react";
// Components
import { SignUpForm } from "@/components/signUp/signUpForm";
import { Footer } from "@/components/home/footer";

export default async function SignUp() {
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
          <SignUpForm />
        </Suspense>
      </section>
      <Footer />
    </>
  );
}
