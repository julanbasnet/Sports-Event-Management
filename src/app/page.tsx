import { redirect } from "next/navigation";

import { getUser } from "@/lib/actions/auth";

export default async function RootPage(): Promise<never> {
  const user = await getUser();

  if (user) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
