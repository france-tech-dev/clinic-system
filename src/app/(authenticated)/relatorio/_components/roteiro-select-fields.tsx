import type { RoteiroCategory } from "@/shared/constants/roteiros";
import { ROTEIROS, type RoteiroId } from "@/shared/constants/roteiros";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function RoteiroSelectFields({
  roteiroId,
  roteiroTick,
  categories,
  onRoteiroChange,
  onCategoryChange,
}: {
  roteiroId: RoteiroId;
  roteiroTick: string;
  categories: RoteiroCategory[];
  onRoteiroChange: (id: RoteiroId) => void;
  onCategoryChange: (tick: string) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="roteiro">Roteiro</Label>
        <Select
          value={roteiroId}
          onValueChange={(value) => onRoteiroChange(value as RoteiroId)}
        >
          <SelectTrigger id="roteiro" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROTEIROS.map((roteiro) => (
              <SelectItem key={roteiro.id} value={roteiro.id}>
                {roteiro.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="roteiro-category">Categoria</Label>
        <Select value={roteiroTick} onValueChange={onCategoryChange}>
          <SelectTrigger id="roteiro-category" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.tick} value={category.tick}>
                {category.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
