function getCommandsModule({ commandsManager }) {
  const actions = {
    updateAccessionStatus: async ({ accessionId, status }) => {
      const res = await fetch(`/api/accessions/${accessionId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        throw new Error(`Failed to update accession status: HTTP ${res.status}`);
      }
      return res.json();
    },
  };

  const definitions = {
    updateAccessionStatus: {
      commandFn: actions.updateAccessionStatus,
    },
  };

  return {
    actions,
    definitions,
    defaultContext: 'VET_PACS',
  };
}

export default getCommandsModule;
