import { PageBackground } from "@/components/ui/layout";
import { RoleSelection } from "@/components/auth/RoleSelection";

export default function RoleSelectionPage() {
  return (
    <div className="min-h-screen">
      <PageBackground pattern="dots" />
      <RoleSelection />
    </div>
  );
}
