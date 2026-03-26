import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button, Label, Separator, Textarea } from '@ohif/ui-next';

interface StudyData {
  id: string;
  studyInstanceUid: string;
  status: 'pending' | 'reviewed' | 'submitted';
  patientName: string | null;
  patientId: string | null;
  patientSex: string | null;
  patientDob: string | null;
  patientWeight: number | null;
  species: string | null;
  breed: string | null;
  clientName: string | null;
  clientId: string | null;
  receivedAt: string;
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

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-baseline justify-between gap-2 py-1">
      <Label className="text-muted-foreground shrink-0 text-xs">{label}</Label>
      <span className="text-foreground truncate text-right text-sm">{value ?? '--'}</span>
    </div>
  );
}

function VetPatientPanel() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const studyInstanceUid = searchParams.get('StudyInstanceUIDs');
  const [study, setStudy] = useState<StudyData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportText, setReportText] = useState('');

  const fetchStudy = useCallback(async (uid: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/studies/by-study-instance-uid/${encodeURIComponent(uid)}`);
      if (!res.ok) {
        throw new Error(res.status === 404 ? 'Study not found' : `HTTP ${res.status}`);
      }
      setStudy(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch study');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (studyInstanceUid) {
      fetchStudy(studyInstanceUid);
    }
  }, [studyInstanceUid, fetchStudy]);

  const handleUpdateStatus = useCallback(async (newStatus: 'reviewed' | 'submitted') => {
    if (!study) return;
    try {
      const res = await fetch(`/api/studies/${study.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      setStudy(await res.json());
      navigate('/pending-studies');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  }, [study, navigate]);

  if (!studyInstanceUid) {
    return (
      <div className="text-muted-foreground flex items-center justify-center p-4 text-sm">
        No study selected
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
          onClick={() => fetchStudy(studyInstanceUid)}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!study) return null;

  return (
    <div className="flex flex-col gap-2 p-3">
      {/* Navigation */}
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:text-foreground -ml-1 mb-1 self-start"
        onClick={() => navigate('/pending-studies')}
      >
        &larr; Back to Study List
      </Button>

      {/* Status */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Study</span>
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
            STATUS_STYLES[study.status] ?? ''
          }`}
        >
          {STATUS_LABELS[study.status] ?? study.status}
        </span>
      </div>

      <Separator />

      {/* Patient */}
      <span className="text-xs font-medium uppercase tracking-wider">Patient</span>
      <InfoRow label="Name" value={study.patientName} />
      <InfoRow label="Species" value={study.species} />
      <InfoRow label="Breed" value={study.breed} />
      <InfoRow label="Sex" value={study.patientSex} />
      <InfoRow
        label="Weight"
        value={study.patientWeight != null ? `${study.patientWeight} kg` : null}
      />

      <Separator />

      {/* Client / Owner */}
      <span className="text-xs font-medium uppercase tracking-wider">Owner</span>
      <InfoRow label="Name" value={study.clientName} />
      <InfoRow label="ID" value={study.clientId} />

      <Separator />

      {/* Report */}
      <span className="text-xs font-medium uppercase tracking-wider">Report</span>
      <Textarea
        className="min-h-[200px]"
        placeholder="Notes for Vets Choice Radiology"
        value={reportText}
        onChange={e => setReportText(e.target.value)}
      />

      <Separator />

      {/* Actions */}
      {study.status === 'pending' && (
        <div className="mt-1 flex flex-col gap-2">
          <Button
            variant="default"
            size="sm"
            className="bg-green-700 hover:bg-green-600"
            onClick={() => handleUpdateStatus('reviewed')}
          >
            Mark as Reviewed
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => handleUpdateStatus('submitted')}
          >
            Submit to VCR
          </Button>
        </div>
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
