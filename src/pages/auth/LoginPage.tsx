import { PageBackground } from "@/components/ui/layout";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen">
      <PageBackground pattern="dots" />
      <LoginForm />
    </div>
  );
}
