# Recieve DICOM files through Orthanc and populate prioritized worklist

This epic simulates the full flow through the system when receiving a DICOM file from a veterinary hospital.
In parallel, the hospital submits an accession form using the NestJS API. The DICOM file and accession are linked via the accessionId.
Finally, all the accessions are prioritized based by submitted date and they appear in a new Worklist table in the UI.

## Proof of concept workflow

1. Orthanc receives DICOM file (typically from the hospital, but we will simulate with Orthanc Explorer 2 web ui)
2. Orthanc stores DICOM file using s3 plugin (locally use MinIO to simulate s3)
3. Orthanc notifies PACS NestJS server with Instance metadata and location; instance location/tags/metadata are persisted to the `pacs` database
4. A PIMS integration calls the PACS server with a new Accession
  a. Utilize common fields for submitting a veterinary radiology study (patient id/name/sex/dob/weight, patient species/breed, client name/id, etc)
5. Once the Accession is submitted, it appears in the worklist UI (new screen separate from existing) in priority order based on submission timestamp
6. From the new Worklist UI, the radiologist can view the DICOM files/images
7. The Accession status is updated from: pending -> in progress -> done
8. Once the status is "done", the accession is removed from the UI worklist (it stays in the database).

Implementation notes:

- Add s3 plugin to Orthanc in local environment
- Orthanc hook to call NestJS API: OnStoredInstance
- Add MinIO to Nginx-Orthanc-Postgres stack to simulate s3 storage
- Do not modify any existing OHIF UI screens - add any new screens separately
- Simulate AWS credentials and API keys for Orthanc->PACS communication
- Create a .http file to simulate Hospital API calls

## Out of scope

- Structured organization of DICOM files in s3; we will add this later
  - What is the best way to organize DICOM files that are coming from multiple corporate groups and/or hospitals
  - For now, we will use a simple flat structure
- Advanced priority scheduling based on criticality (1 hr STAT, 2 hr STAT, etc)

## References

- Orthanc server scripting: https://orthanc.uclouvain.be/book/users/lua.html
- Emulate s3 storage locally using MinIO (add to recipe docker compose stack): https://orthanc.uclouvain.be/book/plugins/object-storage.html#emulation-of-aws-s3-using-minio
