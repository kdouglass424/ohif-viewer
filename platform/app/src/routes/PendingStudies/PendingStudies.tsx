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

interface StudyListItem {
  id: string;
  studyInstanceUid: string;
  status: 'pending' | 'reviewed' | 'submitted';
  receivedAt: string;
  patientName: string | null;
  species: string | null;
  breed: string | null;
  clientName: string | null;
}

interface StudyListResponse {
  data: StudyListItem[];
  total: number;
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-900/50 text-yellow-200',
  reviewed: 'bg-green-900/50 text-green-200',
  submitted: 'bg-primary/20 text-primary',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  reviewed: 'Reviewed',
  submitted: 'Submitted',
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString();
}

type StatusFilter = 'pending' | 'reviewed' | 'submitted' | 'all';

const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'all', label: 'All' },
];

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      data-cy="study-list-status-badge"
      className={cn(
        'inline-block rounded-full px-2 py-0.5 text-xs font-medium',
        STATUS_STYLES[status]
      )}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export default function PendingStudies(): React.ReactElement {
  const navigate = useNavigate();
  const [studies, setStudies] = useState<StudyListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');

  const fetchStudies = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.set('status', statusFilter);
      }
      const res = await fetch(`/api/studies?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const json: StudyListResponse = await res.json();
      setStudies(json.data);
      setTotal(json.total);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch studies');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchStudies();

    const eventSource = new EventSource('/api/studies/events');
    eventSource.onmessage = () => fetchStudies();
    eventSource.onerror = () => {
      eventSource.onopen = () => fetchStudies();
    };
    return () => eventSource.close();
  }, [fetchStudies]);

  const handleViewStudy = useCallback(
    (item: StudyListItem) => {
      if (!item.studyInstanceUid) {
        return;
      }
      navigate(`/reading/orthanc?StudyInstanceUIDs=${item.studyInstanceUid}`);
    },
    [navigate]
  );

  return (
    <div className="bg-background text-foreground flex h-full flex-col">
      <nav className="border-border bg-muted flex items-center gap-4 border-b px-6 py-2 text-sm">
        <Link
          to="/"
          className="text-muted-foreground hover:text-foreground"
          data-cy="study-list-nav-studylist"
        >
          Study List
        </Link>
        <span className="text-muted-foreground/50">/</span>
        <span className="text-foreground">Pending Studies</span>
      </nav>

      <div className="border-border flex items-center justify-between border-b px-6 py-4">
        <div>
          <h1 className="text-2xl font-semibold">Pending Studies</h1>
          <p className="text-muted-foreground text-sm">
            {studies.length} of {total} {total === 1 ? 'study' : 'studies'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as StatusFilter)}
          >
            <SelectTrigger
              className="w-[180px]"
              data-cy="study-list-status-filter"
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
            dataCY="study-list-refresh"
            onClick={() => {
              setIsLoading(true);
              fetchStudies();
            }}
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 py-4">
        {isLoading && studies.length === 0 ? (
          <div className="text-muted-foreground flex h-64 items-center justify-center">
            Loading studies...
          </div>
        ) : error ? (
          <div className="text-destructive flex h-64 items-center justify-center">
            Error: {error}
          </div>
        ) : studies.length === 0 ? (
          <div className="text-muted-foreground flex h-64 items-center justify-center">
            No pending studies
          </div>
        ) : (
          <Table data-cy="study-list-table">
            <TableHeader>
              <TableRow className="text-xs uppercase tracking-wider">
                <TableHead>Patient</TableHead>
                <TableHead>Species</TableHead>
                <TableHead>Breed</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Received</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studies.map((item) => (
                <TableRow
                  key={item.id}
                  data-cy="study-list-row"
                >
                  <TableCell>{item.patientName ?? '—'}</TableCell>
                  <TableCell>{item.species ?? '—'}</TableCell>
                  <TableCell>{item.breed ?? '—'}</TableCell>
                  <TableCell>{item.clientName ?? '—'}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatTime(item.receivedAt)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={item.status} />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="default"
                      size="sm"
                      dataCY="study-list-view-study"
                      onClick={() => handleViewStudy(item)}
                    >
                      View Study
                    </Button>
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
