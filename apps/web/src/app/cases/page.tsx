'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table';
import {
  Plus,
  MoreHorizontal,
  ArrowUpDown,
  Filter,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

type Case = {
  id: string;
  caseNumber: string;
  title: string;
  status: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'COMPLETED' | 'REJECTED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  assignedTo: string;
  createdAt: string;
};

const data: Case[] = [
  {
    id: '1',
    caseNumber: 'CV-2024-001',
    title: 'Pharmacy A - Voucher Discrepancy',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    assignedTo: 'John Doe',
    createdAt: '2024-03-01',
  },
  {
    id: '2',
    caseNumber: 'CV-2024-002',
    title: 'Pharmacy B - Potential Fraud Alert',
    status: 'UNDER_REVIEW',
    priority: 'CRITICAL',
    assignedTo: 'Jane Smith',
    createdAt: '2024-03-02',
  },
  {
    id: '3',
    caseNumber: 'CV-2024-003',
    title: 'Pharmacy C - Routine Audit',
    status: 'PENDING',
    priority: 'LOW',
    assignedTo: 'Unassigned',
    createdAt: '2024-03-05',
  },
  {
    id: '4',
    caseNumber: 'CV-2024-004',
    title: 'Pharmacy D - Bulk Prescription Review',
    status: 'COMPLETED',
    priority: 'MEDIUM',
    assignedTo: 'Robert Brown',
    createdAt: '2024-02-28',
  },
];

const statusStyles = {
  PENDING: 'bg-slate-100 text-slate-700',
  ASSIGNED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-700',
  UNDER_REVIEW: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
};

const priorityStyles = {
  LOW: 'bg-slate-50 text-slate-600',
  MEDIUM: 'bg-blue-50 text-blue-600',
  HIGH: 'bg-orange-50 text-orange-600',
  CRITICAL: 'bg-red-50 text-red-600 border border-red-100',
};

const columns: ColumnDef<Case>[] = [
  {
    accessorKey: 'caseNumber',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Case ID
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-mono font-medium">{row.getValue('caseNumber')}</div>,
  },
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => <div className="max-w-[300px] truncate">{row.getValue('title')}</div>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as keyof typeof statusStyles;
      return (
        <Badge className={statusStyles[status] + ' shadow-none'}>
          {status.replace('_', ' ')}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'priority',
    header: 'Priority',
    cell: ({ row }) => {
      const priority = row.getValue('priority') as keyof typeof priorityStyles;
      return (
        <Badge className={priorityStyles[priority] + ' shadow-none'}>
          {priority}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'assignedTo',
    header: 'Assigned To',
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const payment = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment.id)}
            >
              Copy case ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>Edit case</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Archive</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function CasesPage() {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cases</h1>
          <p className="text-slate-500 mt-1">Manage and track verification cases</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-2 bg-blue-600">
            <Plus className="h-4 w-4" />
            New Case
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 flex items-center justify-between border-b">
            <div className="flex items-center gap-4 w-full max-w-sm">
              <div className="relative w-full">
                 <Input
                   placeholder="Filter cases..."
                   className="pl-4"
                 />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="rounded-md border-none">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="bg-slate-50/50">
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
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
                      data-state={row.getIsSelected() && 'selected'}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
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
          <div className="flex items-center justify-end space-x-2 p-4 border-t">
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
        </CardContent>
      </Card>
    </div>
  );
}
