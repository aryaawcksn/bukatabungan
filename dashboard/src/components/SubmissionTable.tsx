
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  MoreHorizontal,
  CreditCard,
  User,
  Calendar,
  MessageSquare,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import type { FormSubmission } from "../DashboardPage";

interface SubmissionTableProps {
  submissions: FormSubmission[];
  loading: boolean;
  onViewDetails: (submission: FormSubmission) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function SubmissionTable({ 
  submissions, 
  loading,
  onViewDetails,
  onApprove,
  onReject 
}: SubmissionTableProps) {
  
  const statusConfig = {
    pending: {
      label: 'Menunggu',
      className: 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200'
    },
    approved: {
      label: 'Disetujui',
      className: 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200'
    },
    rejected: {
      label: 'Ditolak',
      className: 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200'
    }
  };

  if (loading) {
     return (
        <div className="w-full h-48 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-slate-500">Memuat data...</p>
            </div>
        </div>
     )
  }

  return (
    <TooltipProvider>
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-slate-50/50">
              <TableHead className="w-[180px] font-semibold text-slate-700">Tanggal & ID</TableHead>
              <TableHead className="min-w-[200px] font-semibold text-slate-700">Nama Nasabah</TableHead>
              <TableHead className="w-[150px] font-semibold text-slate-700">Rekening</TableHead>
              <TableHead className="w-[150px] font-semibold text-slate-700">Kewarganegaraan</TableHead>
              <TableHead className="w-[140px] font-semibold text-slate-700">Status</TableHead>
              <TableHead className="w-[100px] font-semibold text-slate-700">Catatan</TableHead>
              <TableHead className="w-[80px] text-right font-semibold text-slate-700">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                  Tidak ada data permohonan ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              submissions.map((submission) => {
                 const status = statusConfig[submission.status] || statusConfig.pending;
                 const hasNotes = submission.approval_notes || submission.rejection_notes;
                 
                 return (
                  <TableRow 
                    key={submission.id} 
                    className="group hover:bg-slate-50 transition-colors cursor-pointer"
                    onDoubleClick={() => onViewDetails(submission)}
                  >
                  {/* Tanggal & Ref */}
                  <TableCell className="align-top py-4">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                            <Calendar className="w-3 h-3" />
                            {submission.submittedAt}
                        </div>
                        <code className="text-[11px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded w-fit">
                            {submission.referenceCode}
                        </code>
                        {/* Edit indicator - simplified */}
                        {/* {submission.edit_count && submission.edit_count > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <Edit3 className="w-3 h-3 text-amber-500" />
                            <span className="text-[10px] text-amber-600 font-medium">
                              Edited {submission.edit_count}x
                            </span>
                          </div>
                        )} */}
                    </div>
                  </TableCell>

                  {/* Nama */}
                  <TableCell className="align-top py-4">
                    <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                            {submission.personalData.fullName}
                        </span>
                        <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                            <User className="w-3 h-3" />
                            {submission.personalData.tipeNasabah === 'lama' ? 'Nasabah Lama' : 'Nasabah Baru'}
                        </div>
                    </div>
                  </TableCell>

                  {/* Rekening Untuk & Tipe */}
                  <TableCell className="align-top py-4">
                    <div className="flex flex-col gap-1">
                         <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                            <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                            {submission.accountInfo.isForSelf ? 'Diri Sendiri' : 'Orang Lain'}
                         </div>
                         <span className="text-xs text-slate-500 pl-5">
                            {submission.savingsType}
                         </span>
                    </div>
                  </TableCell>

                   {/* Kewarganegaraan */}
                   <TableCell className="align-top py-4">
                    <span className="text-sm text-slate-700 font-medium">
                        {submission.personalData.citizenship}
                    </span>
                  </TableCell>

                    {/* Status */}
                    <TableCell className="align-top py-4">
                      <Badge variant="outline" className={`${status.className} font-medium tracking-wide`}>
                          {status.label}
                      </Badge>
                    </TableCell>

                    {/* Catatan */}
                    <TableCell className="align-top py-4">
                      {hasNotes ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-200">
                              <MessageSquare className="h-4 w-4 text-slate-600" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="max-w-sm p-4">
                            <div className="space-y-2">
                              <p className="font-semibold text-xs border-b pb-2 mb-2">
                                {submission.status === 'approved' ? 'Catatan Persetujuan:' : 'Alasan Penolakan:'}
                              </p>
                              <p className="text-xs whitespace-pre-wrap leading-relaxed">
                                {submission.approval_notes || submission.rejection_notes}
                              </p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </TableCell>

                  {/* Aksi */}
                  <TableCell className="align-top py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-200">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4 text-slate-600" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onViewDetails(submission)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Lihat Detail
                        </DropdownMenuItem>
                         {submission.status === 'pending' && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => onApprove(submission.id)} className="text-green-600 focus:text-green-700 focus:bg-green-50">
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Setujui
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onReject(submission.id)} className="text-red-600 focus:text-red-700 focus:bg-red-50">
                                <XCircle className="mr-2 h-4 w-4" />
                                Tolak
                                </DropdownMenuItem>
                            </>
                         )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
    </TooltipProvider>
  );
}
