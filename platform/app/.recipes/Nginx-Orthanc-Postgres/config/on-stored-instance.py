import orthanc
import json
import os
import asyncio
from bullmq import Queue

REDIS_HOST = os.environ.get('REDIS_HOST', 'redis')
REDIS_PORT = int(os.environ.get('REDIS_PORT', '6379'))
QUEUE_NAME = 'dicom-instances'
QUEUE_OPTS = {
    'connection': {
        'host': REDIS_HOST,
        'port': REDIS_PORT,
    }
}


async def enqueue(payload):
    queue = Queue(QUEUE_NAME, QUEUE_OPTS)
    await queue.add('instance-stored', payload, {
        'attempts': 5,
        'backoff': {'type': 'exponential', 'delay': 1000},
    })
    await queue.close()


def OnStoredInstance(dicom, instanceId):
    try:
        tags = json.loads(dicom.GetInstanceSimplifiedJson())
        payload = {
            'orthancId': instanceId,
            'sopInstanceUid': tags.get('SOPInstanceUID'),
            'seriesInstanceUid': tags.get('SeriesInstanceUID'),
            'studyInstanceUid': tags.get('StudyInstanceUID'),
            'sopClassUid': tags.get('SOPClassUID'),
            'modality': tags.get('Modality'),
            'patientId': tags.get('PatientID'),
            'patientName': tags.get('PatientName'),
        }
        asyncio.run(enqueue(payload))
        orthanc.LogInfo(f'Queued instance {instanceId} to Redis')
    except Exception as e:
        orthanc.LogError(f'Failed to queue instance {instanceId}: {e}')


orthanc.RegisterOnStoredInstanceCallback(OnStoredInstance)
