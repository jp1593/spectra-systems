import { fail } from "@sveltejs/kit";

export async function load({ locals, cookies }) {
  async function getUsers() {
    const token = cookies.get("token")
    const response = await fetch("http://localhost:8080/nexus/users", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    const result = await response.json();
    return result;
  }

  return { user: locals.user, users: getUsers() };
}

export const actions = {
  updateUser: async ({ request, cookies }) => {
    const token = cookies.get("token")
    const data = await request.formData();

    for (const [, value] of data) {
      if (value === "" || value === "undefined") {
        return fail(400, {
          error: "Please fill in all the fields",
        });
      }
    }

    try {
      const response = await fetch("http://localhost:8080/update-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: data.get("userId"),
          firstName: data.get("firstName"),
          lastName: data.get("lastName"),
          originCountry: data.get("originCountry"),
          passportNumber: data.get("passportNumber"),
          role: data.get("role"),
          age: data.get("age"),
          percentage: data.get("percentage"),
        }),
      });

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }
    } catch (error) {
      if (error instanceof Error) {
        return fail(500, {
          error: error.message,
        });
      }
    }
  },
};