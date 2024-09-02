// Data
import { getUserById } from "@/lib/data";
// Components
import { SectionTitle } from "@/components/user/sectionTitle";
import { UserModificationForm } from "@/components/user/administration/userModificationForm";

export default async function UserModificationHome({
  params,
}: {
  params: { _id: string };
}) {
  const user = await getUserById(params._id);

  return (
    <>
      <SectionTitle
        title="Update User"
        description="Update a User and Reflect it in the Database"
      />
      <UserModificationForm user={user} />
    </>
  );
}
