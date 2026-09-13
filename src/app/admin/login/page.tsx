import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { hasValidSession } from "@/lib/admin/auth";

export default async function LoginPage() {
  if (await hasValidSession()) redirect("/admin");
  return <LoginForm />;
}
