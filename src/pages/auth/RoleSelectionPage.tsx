import { InteractiveBackground } from "@/components/ui/interactive-background";
import { RoleSelection } from "@/components/auth/RoleSelection";

export default function RoleSelectionPage() {
  return (
    <div className="min-h-screen">
      <InteractiveBackground 
        particleCount={20}
        enableParticles={true}
        enableGradientOrbs={true}
        enableGridPattern={true}
        enableNoise={false}
      />
      <RoleSelection />
    </div>
  );
}
