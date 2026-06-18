'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateCasePage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/cases">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Create New Case</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Case Information</CardTitle>
          <CardDescription>Enter the basic details for the new verification case.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Case Title</Label>
              <Input id="title" placeholder="e.g. Pharmacy A - Voucher Audit" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">Referral Source</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="automated">Automated Flag</SelectItem>
                  <SelectItem value="manual">Manual Referral</SelectItem>
                  <SelectItem value="whistleblower">Whistleblower</SelectItem>
                  <SelectItem value="routine">Routine Audit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              className="w-full min-h-[120px] rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Provide a detailed description of the case..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignment">Assign To</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select officer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Leave Unassigned</SelectItem>
                  <SelectItem value="me">Assign to Me</SelectItem>
                  <SelectItem value="john">John Doe (Technical)</SelectItem>
                  <SelectItem value="jane">Jane Smith (Compliance)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" asChild>
              <Link href="/cases">Cancel</Link>
            </Button>
            <Button className="bg-blue-600">Create Case</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
