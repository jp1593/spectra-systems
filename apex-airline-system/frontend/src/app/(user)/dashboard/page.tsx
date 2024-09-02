import { cookies } from "next/headers";
// Components
import { SectionTitle } from "@/components/user/sectionTitle";
// JSON Web Token Utilities
import * as jose from "jose";

export default async function DashboardHome() {
  const token = cookies().get("token");

  const { payload }: { payload: User } = await jose.jwtVerify(
    token!.value,
    new TextEncoder().encode(process.env.JWT_SECRET)
  );

  return (
    <>
      <SectionTitle
        title="Dashboard"
        description="View Your Important Information"
      />
      <div className="flex flex-col gap-y-5 p-3 border rounded-lg">
        <div className="flex gap-x-5">
          <div className="flex flex-col gap-x-2">
            <div className="font-bold">Welcome Back,</div>
            <div>{payload.firstName + " " + payload.lastName}</div>
          </div>
          <div className="w-12 rounded-full border border-foreground background bg-white bg-gradient-to-r from-cyan-500 via-purple-500 to-blue-500"/>
        </div>
        <div className="grid grid-cols-2 gap-y-5">
          <UserSection title="First Name" value={payload.firstName} />
          <UserSection title="Last Name" value={payload.lastName} />
          <UserSection title="Email" value={payload.email} />
          <UserSection title="Age" value={payload.age} />
          <UserSection title="Passport Number" value={payload.passportNumber} />
          <UserSection
            title="Country of Origin"
            value={payload.originCountry}
          />
        </div>
      </div>
    </>
  );
}

function UserSection({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="flex flex-col">
      <div className="font-bold text-sm">{title}</div>
      <div className="text-muted-foreground text-sm">{value}</div>
    </div>
  );
}
