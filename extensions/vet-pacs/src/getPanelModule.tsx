import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, Label, Separator } from '@ohif/ui-next';

interface AccessionData {
  id: string;
  accessionNumber: string;
  status: 'pending' | 'in_progress' | 'done';
  patientName: string | null;
  patientId: string | null;
  patientSex: string | null;
  patientDob: string | null;
  patientWeight: number | null;
  species: string | null;
  breed: string | null;
  clientName: string | null;
  clientId: string | null;
  submittedAt: string;
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

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-baseline justify-between gap-2 py-1">
      <Label className="text-muted-foreground shrink-0 text-xs">{label}</Label>
      <span className="text-foreground truncate text-right text-sm">{value ?? '--'}</span>
    </div>
  );
}

function VetPatientPanel() {
  const [searchParams] = useSearchParams();
  const accessionNumber = searchParams.get('AccessionNumber');
  const [accession, setAccession] = useState<AccessionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccession = useCallback(async (accNum: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/accessions/by-accession-number/${encodeURIComponent(accNum)}`);
      if (!res.ok) {
        throw new Error(res.status === 404 ? 'Accession not found' : `HTTP ${res.status}`);
      }
      setAccession(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch accession');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (accessionNumber) {
      fetchAccession(accessionNumber);
    }
  }, [accessionNumber, fetchAccession]);

  const handleMarkComplete = useCallback(async () => {
    if (!accession) return;
    try {
      const res = await fetch(`/api/accessions/${accession.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'done' }),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      setAccession(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  }, [accession]);

  if (!accessionNumber) {
    return (
      <div className="text-muted-foreground flex items-center justify-center p-4 text-sm">
        No accession number in URL
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-muted-foreground flex items-center justify-center p-4 text-sm">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-sm">
        <p className="text-destructive">{error}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => fetchAccession(accessionNumber)}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!accession) return null;

  return (
    <div className="flex flex-col gap-2 p-3">
      {/* Status */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Accession</span>
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
            STATUS_STYLES[accession.status] ?? ''
          }`}
        >
          {STATUS_LABELS[accession.status] ?? accession.status}
        </span>
      </div>
      <span className="text-muted-foreground font-mono text-xs">{accession.accessionNumber}</span>

      <Separator />

      {/* Patient */}
      <span className="text-xs font-medium uppercase tracking-wider">Patient</span>
      <InfoRow label="Name" value={accession.patientName} />
      <InfoRow label="Species" value={accession.species} />
      <InfoRow label="Breed" value={accession.breed} />
      <InfoRow label="Sex" value={accession.patientSex} />
      <InfoRow
        label="Weight"
        value={accession.patientWeight != null ? `${accession.patientWeight} kg` : null}
      />

      <Separator />

      {/* Client / Owner */}
      <span className="text-xs font-medium uppercase tracking-wider">Owner</span>
      <InfoRow label="Name" value={accession.clientName} />
      <InfoRow label="ID" value={accession.clientId} />

      <Separator />

      {/* Actions */}
      {accession.status === 'in_progress' && (
        <Button
          variant="default"
          size="sm"
          className="mt-1 bg-green-700 hover:bg-green-600"
          onClick={handleMarkComplete}
        >
          Mark Complete
        </Button>
      )}
    </div>
  );
}

function getPanelModule({ commandsManager, extensionManager, servicesManager }) {
  return [
    {
      name: 'vetPatientInfo',
      iconName: 'tab-patient-info',
      iconLabel: 'Patient',
      label: 'Vet Patient',
      component: VetPatientPanel,
    },
  ];
}

export default getPanelModule;
