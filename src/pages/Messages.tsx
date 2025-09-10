import { Navigation } from "@/components/navigation";
import { MessageCenter } from "@/components/MessageCenter";

export default function Messages() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-6">
        <MessageCenter />
      </main>
    </div>
  );
}