import { PageBackground } from "@/components/ui/layout";
import { InteractiveBackground } from "@/components/ui/interactive-background";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen">
      <InteractiveBackground 
        particleCount={20}
        enableParticles={true}
        enableGradientOrbs={true}
        enableGridPattern={true}
        enableNoise={false}
      />
      <LoginForm />
    </div>
  );
}
