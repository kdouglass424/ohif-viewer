function getCommandsModule({ commandsManager }) {
  const actions = {
    updateStudyStatus: async ({ studyId, status }) => {
      const res = await fetch(`/api/studies/${studyId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        throw new Error(`Failed to update study status: HTTP ${res.status}`);
      }
      return res.json();
    },
  };

  const definitions = {
    updateStudyStatus: {
      commandFn: actions.updateStudyStatus,
    },
  };

  return {
    actions,
    definitions,
    defaultContext: 'VET_PACS',
  };
}

export default getCommandsModule;
