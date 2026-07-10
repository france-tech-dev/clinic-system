"use client";
import { searchLeads } from "@/API/leads/leads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TooltipAction } from "@/components/ui/tooltip-action";
import { useMutation } from "@tanstack/react-query";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  IconArrowsUpDown,
  IconLoader2,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { EnrollmentFormDialog } from "./enrollment-form-dialog";
import { format } from "date-fns";

export type LeadRow = {
  id: string;
  nome: string;
  email: string;
  ddd?: string;
  telefone?: string;
  data_cadastro: string;
  ultimo_login: string;
  [key: string]: unknown;
};

type SearchResult = {
  data: LeadRow[];
  total: number;
  page: number;
  timestamp: string;
};

const columns: ColumnDef<LeadRow>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <TooltipAction title={String(row.original.id)} asChild>
        <span>{row.original.id}</span>
      </TooltipAction>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "nome",
    header: "Nome",
    cell: ({ row }) => (
      <TooltipAction title={row.original.nome} asChild>
        <span>{row.original.nome}</span>
      </TooltipAction>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <TooltipAction title={row.original.email} asChild>
        <span>{row.original.email}</span>
      </TooltipAction>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "telefone",
    header: "Telefone",
    cell: ({ row }) => {
      const telefone = row.original.telefone
        ? `${row.original.ddd || ""} ${row.original.telefone}`.trim()
        : "-";
      return (
        <TooltipAction title={telefone} asChild>
          <span>{telefone}</span>
        </TooltipAction>
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: "data_cadastro",
    header: "Data de criação",
    cell: ({ row }) => (
      <TooltipAction
        title={format(row.original.data_cadastro, "dd/MM/yyyy")}
        asChild
      >
        <span>{format(row.original.data_cadastro, "dd/MM/yyyy")}</span>
      </TooltipAction>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "ultimo_login",
    header: "Último login",
    cell: ({ row }) => (
      <TooltipAction
        title={format(row.original.ultimo_login, "dd/MM/yyyy")}
        asChild
      >
        <span>{format(row.original.ultimo_login, "dd/MM/yyyy")}</span>
      </TooltipAction>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "actions",
    header: "Ações",
    cell: ({ row }) => <EnrollmentFormDialog enrollment={row.original} />,
  },
];

export function EnrollmentTable() {
  "use no memo";
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);

  const { mutate: searchMutation, isPending: isSearching } = useMutation({
    mutationFn: (searchParams: Record<string, unknown>) =>
      searchLeads(searchParams, 0),
    onSuccess: (result) => {
      if (result.data && result.data.length > 0) {
        setSearchResults(result);
        toast.success(`${result.data.length} parceiro(s) encontrado(s)`);
      } else {
        setSearchResults({
          data: [],
          total: 0,
          page: 0,
          timestamp: new Date().toISOString(),
        });
        toast.info("Nenhum parceiro encontrado com os critérios informados");
      }
    },
    onError: (error) => {
      const errorMessage =
        error?.message || "Erro ao buscar parceiros. Tente novamente.";
      toast.error(errorMessage);
      console.error("Erro ao buscar parceiros:", error);
    },
  });

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      toast.warning("Digite um termo para buscar (email, CPF ou telefone)");
      return;
    }

    const cleanSearch = searchTerm.replace(/\D/g, "");
    const searchParams: Record<string, unknown> = {};

    if (searchTerm.includes("@")) {
      searchParams.email = searchTerm.trim().toLowerCase();
    } else if (cleanSearch.length === 11) {
      searchParams.cpf = cleanSearch;
    } else if (cleanSearch.length >= 8) {
      searchParams.telefone = cleanSearch;
    } else {
      searchParams.nome = searchTerm.trim().toLowerCase();
    }

    searchMutation(searchParams);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSearchResults(null);
  };

  const showLoading = isSearching;
  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([]);

  // Usa dados da busca
  const tableData = useMemo(() => searchResults?.data || [], [searchResults]);

  // TanStack Table uses interior mutability; React Compiler skips memoizing this component.
  // eslint-disable-next-line -- useReactTable incompatible with compiler memoization
  const table = useReactTable({
    data: tableData,
    columns,
    getRowId: (row: LeadRow) => row.id?.toString() || Math.random().toString(),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold flex gap-2">
          Grupos de Inscrição{" "}
        </h2>
        <div className="flex items-center gap-2">
          <EnrollmentFormDialog />
        </div>
      </div>

      {/* Campo de busca */}
      <div className="mb-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
        <div className="flex-1 relative">
          <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
          <Input
            placeholder="Buscar por email, CPF ou telefone..."
            value={searchTerm}
            onChange={(e) => {
              const value = e.target.value;
              setSearchTerm(value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                handleSearch();
              }
            }}
            onFocus={(e) => {
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="pl-10 pr-10"
            autoComplete="off"
            type="text"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleClearSearch();
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:bg-muted rounded p-1 transition-colors z-20"
              aria-label="Limpar busca"
            >
              <IconX className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
        <Button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleSearch();
          }}
          disabled={isSearching || !searchTerm.trim()}
        >
          {isSearching ? (
            <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <IconSearch className="mr-2 h-4 w-4" />
          )}
          {isSearching ? "Buscando..." : "Buscar"}
        </Button>
      </div>
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder ? null : (
                        <div
                          className="flex items-center gap-2 cursor-pointer select-none"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {header.column.getCanSort() && (
                            <IconArrowsUpDown className="h-4 w-4" />
                          )}
                        </div>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className={"group"}>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="relative z-0 group-hover:opacity-20 hover:opacity-100! transition-all duration-300 group:focus-within:opacity-20 focus-within:bg-muted"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {showLoading
                    ? "Carregando..."
                    : "Nenhum resultado encontrado"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
