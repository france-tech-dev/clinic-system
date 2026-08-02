import Link from "next/link";
import { ArrowLeft, FileText, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { paths } from "@/shared/constants/paths";

export function PatientDetailHeader({
  notes,
  pending,
  onEdit,
  onPreviewReport,
  onRemove,
}: {
  notes?: string;
  pending: boolean;
  onEdit: () => void;
  onPreviewReport: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <Link
          href={paths.pacientes}
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Pacientes
        </Link>
        {notes && <p className="mt-1 text-sm text-muted-foreground">{notes}</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Pencil className="size-4" />
          Editar
        </Button>
        <Button variant="outline" size="sm" onClick={onPreviewReport}>
          <FileText className="size-4" />
          Prontuário PDF
        </Button>
        <DeleteConfirmDialog onConfirm={onRemove} disabled={pending}>
          <Button variant="destructive" size="sm" disabled={pending}>
            <Trash2 className="size-4" />
            Remover
          </Button>
        </DeleteConfirmDialog>
      </div>
    </div>
  );
}
