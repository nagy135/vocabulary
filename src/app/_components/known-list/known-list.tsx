"use client";

import * as React from "react";
import {
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  RowSelectionState,
} from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";

import { Button } from "~/app/_components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/app/_components/ui/dropdown-menu";
import { Input } from "~/app/_components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/app/_components/ui/table";

import { type SelectKnown, type SelectWord } from "~/server/db/schema";
import { useCallback, useEffect, useState } from "react";
import { columns } from "./table-columns";
import useScreenWidth from "~/app/hooks/use-screen-width";
import { AnimationPosition, useAnimation } from "~/animation";
import { api } from "~/trpc/react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useToast } from "../ui/use-toast";

export type KnownRecord = {
  knownId: SelectKnown["id"];
  wordName: SelectWord["name"];
  wordTranslation: SelectWord["translation"];
};
type KnownList = {
  knowns: KnownRecord[];
};

export default function KnownList({ knowns }: KnownList) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const screenWidth = useScreenWidth();
  const { setPosition, style } = useAnimation({
    variety: "reveal-hv",
    offset: { init: 49, middle: -10 },
    timeout: 500,
    orientation: screenWidth && screenWidth > 768 ? "horizontal" : "vertical",
  });

  useEffect(() => {
    if (Object.keys(rowSelection).length) setPosition(AnimationPosition.middle);
    else setPosition(AnimationPosition.init);
  }, [rowSelection]);

  const deleteKnown = api.known.deleteById.useMutation({
    onSuccess: () => {
      toast({
        title: "Deleted known word",
        variant: "destructive",
      });
      router.refresh();
    },
  });

  const deleteManyKnown = api.known.deleteManyById.useMutation({
    onSuccess: (_data, { ids }) => {
      toast({
        title: `Deleted ${ids.length} selected known word(s)`,
        variant: "destructive",
      });
      router.refresh();
      table.resetRowSelection();
    },
  });

  const deleteSelectedRows = useCallback(() => {
    if (!user) {
      alert("no user");
      return;
    }

    deleteManyKnown.mutate({
      userId: user.id,
      ids: Object.keys(rowSelection).map(
        (id) => table.getRow(id).original.knownId,
      ),
    });
  }, [deleteManyKnown, rowSelection, user]);

  const deleteCall = useCallback(
    (knownId: number) => {
      deleteKnown.mutate(knownId);
    },
    [deleteKnown],
  );

  const table = useReactTable({
    data: knowns,
    columns: columns(deleteCall),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="mt-10 w-full p-5">
      <div className="flex items-end  justify-between gap-2 py-4">
        <Input
          placeholder="Filter translation..."
          value={
            (table.getColumn("wordTranslation")?.getFilterValue() as string) ??
            ""
          }
          onChange={(event) =>
            table
              .getColumn("wordTranslation")
              ?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="flex flex-col gap-2 md:flex-row">
          <Button
            disabled={!table.getFilteredSelectedRowModel().rows.length}
            onClick={deleteSelectedRows}
            variant="destructive"
            className="ml-auto"
            style={style}
          >
            Delete selected
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto w-full">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
