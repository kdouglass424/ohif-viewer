import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  cn,
} from '@ohif/ui-next';

interface WorklistItem {
  id: string;
  accessionNumber: string;
  status: 'pending' | 'in_progress' | 'done';
  submittedAt: string;
  studyInstanceUid: string | null;
  patientName: string | null;
  species: string | null;
  breed: string | null;
  clientName: string | null;
}

interface WorklistResponse {
  data: WorklistItem[];
  total: number;
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-900/50 text-yellow-200',
  in_progress: 'bg-primary/20 text-primary',
  done: 'bg-green-900/50 text-green-200',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  done: 'Done',
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString();
}

type StatusFilter = 'active' | 'pending' | 'in_progress' | 'done' | 'all';

const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'active', label: 'Active (Pending + In Progress)' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
  { value: 'all', label: 'All' },
];

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      data-cy="worklist-status-badge"
      className={cn(
        'inline-block rounded-full px-2 py-0.5 text-xs font-medium',
        STATUS_STYLES[status]
      )}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export default function PrioritizedWorklist(): React.ReactElement {
  const navigate = useNavigate();
  const [worklist, setWorklist] = useState<WorklistItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active');
  const [confirmingComplete, setConfirmingComplete] = useState<string | null>(null);

  const fetchWorklist = useCallback(async () => {
    try {
      const res = await fetch('/api/worklist');
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const json: WorklistResponse = await res.json();
      setWorklist(json.data);
      setTotal(json.total);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch worklist');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorklist();
    const interval = setInterval(fetchWorklist, 30_000);
    return () => clearInterval(interval);
  }, [fetchWorklist]);

  const handleViewStudy = useCallback(
    async (item: WorklistItem) => {
      if (!item.studyInstanceUid && !item.accessionNumber) {
        return;
      }
      if (item.status === 'pending') {
        try {
          await fetch(`/api/accessions/${item.id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'in_progress' }),
          });
        } catch {
          // Navigate even if status update fails
        }
      }
      const queryParams = new URLSearchParams();
      if (item.accessionNumber) {
        queryParams.set('AccessionNumber', item.accessionNumber);
      }
      if (item.studyInstanceUid) {
        queryParams.set('StudyInstanceUIDs', item.studyInstanceUid);
      }
      navigate(`/viewer/orthanc?${queryParams.toString()}`);
    },
    [navigate]
  );

  const handleMarkComplete = useCallback(
    async (item: WorklistItem) => {
      try {
        const res = await fetch(`/api/accessions/${item.id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'done' }),
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        fetchWorklist();
      } catch {
        setError('Failed to update status');
      } finally {
        setConfirmingComplete(null);
      }
    },
    [fetchWorklist]
  );

  const filteredWorklist = worklist.filter((item) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return item.status !== 'done';
    return item.status === statusFilter;
  });

  return (
    <div className="bg-background text-foreground flex h-full flex-col">
      <nav className="border-border bg-muted flex items-center gap-4 border-b px-6 py-2 text-sm">
        <Link
          to="/"
          className="text-muted-foreground hover:text-foreground"
          data-cy="worklist-nav-studylist"
        >
          Study List
        </Link>
        <span className="text-muted-foreground/50">/</span>
        <span className="text-foreground">Worklist</span>
      </nav>

      <div className="border-border flex items-center justify-between border-b px-6 py-4">
        <div>
          <h1 className="text-2xl font-semibold">Prioritized Worklist</h1>
          <p className="text-muted-foreground text-sm">
            {filteredWorklist.length} of {total} {total === 1 ? 'accession' : 'accessions'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as StatusFilter)}
          >
            <SelectTrigger
              className="w-[220px]"
              data-cy="worklist-status-filter"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTER_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="secondary"
            size="default"
            dataCY="worklist-refresh"
            onClick={() => {
              setIsLoading(true);
              fetchWorklist();
            }}
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 py-4">
        {isLoading && worklist.length === 0 ? (
          <div className="text-muted-foreground flex h-64 items-center justify-center">
            Loading worklist...
          </div>
        ) : error ? (
          <div className="text-destructive flex h-64 items-center justify-center">
            Error: {error}
          </div>
        ) : filteredWorklist.length === 0 ? (
          <div className="text-muted-foreground flex h-64 items-center justify-center">
            No pending accessions
          </div>
        ) : (
          <Table data-cy="worklist-table">
            <TableHeader>
              <TableRow className="text-xs uppercase tracking-wider">
                <TableHead>Accession #</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Species</TableHead>
                <TableHead>Breed</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWorklist.map((item) => (
                <TableRow
                  key={item.id}
                  data-cy="worklist-row"
                >
                  <TableCell className="font-mono">{item.accessionNumber}</TableCell>
                  <TableCell>{item.patientName ?? '—'}</TableCell>
                  <TableCell>{item.species ?? '—'}</TableCell>
                  <TableCell>{item.breed ?? '—'}</TableCell>
                  <TableCell>{item.clientName ?? '—'}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatTime(item.submittedAt)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={item.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {item.studyInstanceUid || item.accessionNumber ? (
                        <Button
                          variant="default"
                          size="sm"
                          dataCY="worklist-view-study"
                          onClick={() => handleViewStudy(item)}
                        >
                          View Study
                        </Button>
                      ) : (
                        <span className="text-muted-foreground/50 text-xs">No study</span>
                      )}
                      {item.status === 'in_progress' &&
                        (confirmingComplete === item.id ? (
                          <span className="flex items-center gap-1">
                            <span className="text-muted-foreground text-xs">Complete?</span>
                            <Button
                              variant="default"
                              size="sm"
                              dataCY="worklist-confirm-complete"
                              className="bg-green-700 hover:bg-green-600"
                              onClick={() => handleMarkComplete(item)}
                            >
                              Yes
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              dataCY="worklist-cancel-complete"
                              onClick={() => setConfirmingComplete(null)}
                            >
                              No
                            </Button>
                          </span>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            dataCY="worklist-mark-complete"
                            className="border-green-700/50 text-green-200 hover:bg-green-900/50"
                            onClick={() => setConfirmingComplete(item.id)}
                          >
                            Mark Complete
                          </Button>
                        ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
