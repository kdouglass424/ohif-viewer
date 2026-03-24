function OnStoredInstance(instanceId, tags, metadata)
  -- Extract DICOM tags from the instance
  local instance = RestApiGet('/instances/' .. instanceId)
  local parsed = ParseJson(instance)
  local mainTags = parsed['MainDicomTags'] or {}

  -- AccessionNumber is a study-level tag; fetch from parent study
  local parentStudyId = parsed['ParentStudy']
  local accessionNumber = nil
  if parentStudyId then
    local study = ParseJson(RestApiGet('/studies/' .. parentStudyId))
    local studyTags = study['MainDicomTags'] or {}
    accessionNumber = studyTags['AccessionNumber']
  end

  -- Build payload for the PACS server
  local payload = {
    orthancId = instanceId,
    sopInstanceUid = mainTags['SOPInstanceUID'],
    seriesInstanceUid = mainTags['SeriesInstanceUID'] or parsed['ParentSeries'],
    studyInstanceUid = mainTags['StudyInstanceUID'] or parentStudyId,
    sopClassUid = mainTags['SOPClassUID'],
    modality = mainTags['Modality'],
    patientId = mainTags['PatientID'],
    patientName = mainTags['PatientName'],
    accessionNumber = accessionNumber,
  }

  -- POST to PACS NestJS server
  local instancesUrl = os.getenv('ORTHANC_INSTANCES_URL') or 'http://host.docker.internal:3002/api/orthanc/instances'
  local apiKey = os.getenv('ORTHANC_API_KEY') or 'dev-orthanc-key'
  local headers = {
    ['Content-Type'] = 'application/json',
    ['x-api-key'] = apiKey,
  }

  -- Use pcall to catch errors without blocking Orthanc
  local success, err = pcall(function()
    HttpPost(instancesUrl,
             DumpJson(payload),
             headers)
  end)

  if not success then
    PrintToStdout('OnStoredInstance: Failed to notify PACS server for instance ' .. instanceId .. ': ' .. tostring(err))
  else
    PrintToStdout('OnStoredInstance: Notified PACS server for instance ' .. instanceId)
  end
end
