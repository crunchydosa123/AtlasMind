import React, { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// --- Type ---
type Resource = {
  id: number;
  name: string;
  format: string;
  uploadedOn: string;
  project: string;
  uploadedBy: string;
};

// --- Mock Data ---
const data: Resource[] = [
  {
    id: 1,
    name: "Lecture Notes.pdf",
    format: "PDF",
    uploadedOn: "2025-10-10",
    project: "Remote Learning",
    uploadedBy: "Pratham Gadkari",
  },
  {
    id: 2,
    name: "Whiteboard Sketch.png",
    format: "Image",
    uploadedOn: "2025-10-12",
    project: "AI Dashboard",
    uploadedBy: "Aarav Sharma",
  },
  {
    id: 3,
    name: "Demo Video.mp4",
    format: "Video",
    uploadedOn: "2025-10-13",
    project: "Analytics Platform",
    uploadedBy: "Sneha Patel",
  },
];

// --- Columns ---
const columns: ColumnDef<Resource>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "format",
    header: "Format",
  },
  {
    accessorKey: "uploadedOn",
    header: "Uploaded On",
  },
  {
    accessorKey: "project",
    header: "Project",
  },
  {
    accessorKey: "uploadedBy",
    header: "Uploaded By",
  },
  {
    id: "select",
    header: "Select",
    cell: ({ row }) => (
      <Button variant="outline" size="sm" onClick={() => alert(`Selected ${row.original.name}`)}>
        Select
      </Button>
    ),
  },
];

// --- Main Component ---
const AllResourcesTable: React.FC = () => {
  const [search, setSearch] = useState("");

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter: search,
    },
    onGlobalFilterChange: setSearch,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, columnId, value) => {
      return String(row.getValue(columnId))
        .toLowerCase()
        .includes(value.toLowerCase());
    },
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Search resources..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-1/3"
        />
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-4">
                  No resources found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AllResourcesTable;
