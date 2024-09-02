import { getUsers } from "@/lib/data";
import { UserCard } from "@/components/user/userCard";

export async function Users() {
  const users = await getUsers();

  return (
    <>
      {users.length === 0 && (
        <div className="flex justify-center items-center h-full">
          <h1 className="text-xl font-bold">No Users Found</h1>
        </div>
      )}
      {users.map((user: User) => (
        <UserCard key={user._id} user={user} />
      ))}
    </>
  );
}
