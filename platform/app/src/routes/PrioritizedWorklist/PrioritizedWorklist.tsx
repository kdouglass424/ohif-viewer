import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

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
  in_progress: 'bg-blue-900/50 text-blue-200',
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

export default function PrioritizedWorklist(): React.ReactElement {
  const navigate = useNavigate();
  const [worklist, setWorklist] = useState<WorklistItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      if (!item.studyInstanceUid) {
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
      navigate(`/viewer/orthanc?StudyInstanceUIDs=${item.studyInstanceUid}`);
    },
    [navigate]
  );

  return (
    <div className="flex h-full flex-col bg-black text-white">
      <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
        <div>
          <h1 className="text-2xl font-semibold">Prioritized Worklist</h1>
          <p className="text-sm text-gray-400">
            {total} active {total === 1 ? 'accession' : 'accessions'}
          </p>
        </div>
        <button
          onClick={() => {
            setIsLoading(true);
            fetchWorklist();
          }}
          className="rounded bg-gray-800 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700"
        >
          Refresh
        </button>
      </div>

      <div className="flex-1 overflow-auto px-6 py-4">
        {isLoading && worklist.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-gray-500">
            Loading worklist...
          </div>
        ) : error ? (
          <div className="flex h-64 items-center justify-center text-red-400">
            Error: {error}
          </div>
        ) : worklist.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-gray-500">
            No pending accessions
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-xs uppercase tracking-wider text-gray-400">
                <th className="px-3 py-3">Accession #</th>
                <th className="px-3 py-3">Patient</th>
                <th className="px-3 py-3">Species</th>
                <th className="px-3 py-3">Breed</th>
                <th className="px-3 py-3">Client</th>
                <th className="px-3 py-3">Submitted</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {worklist.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-800/50 hover:bg-gray-900/50"
                >
                  <td className="px-3 py-3 font-mono">{item.accessionNumber}</td>
                  <td className="px-3 py-3">{item.patientName ?? '—'}</td>
                  <td className="px-3 py-3">{item.species ?? '—'}</td>
                  <td className="px-3 py-3">{item.breed ?? '—'}</td>
                  <td className="px-3 py-3">{item.clientName ?? '—'}</td>
                  <td className="px-3 py-3 text-gray-400">{formatTime(item.submittedAt)}</td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[item.status] ?? ''}`}
                    >
                      {STATUS_LABELS[item.status] ?? item.status}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    {item.studyInstanceUid ? (
                      <button
                        onClick={() => handleViewStudy(item)}
                        className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-500"
                      >
                        View Study
                      </button>
                    ) : (
                      <span className="text-xs text-gray-600">No study</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
