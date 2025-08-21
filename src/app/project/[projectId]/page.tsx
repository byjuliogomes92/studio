import { PageList } from "@/components/app/page-list";

export default function ProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  return (
    <main className="bg-muted/40">
      <PageList projectId={params.projectId} />
    </main>
  );
}
