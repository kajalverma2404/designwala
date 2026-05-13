import LoadingDiya from "@/components/LoadingDiya";

export default function GlobalLoading() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center">
      <LoadingDiya size="lg" message="Loading…" subMessage="Ek second…" />
    </main>
  );
}
