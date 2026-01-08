/**
 * Models Component
 * Displays model quota/status list
 * Registers itself to window.Components for Alpine.js to consume
 */
window.Components = window.Components || {};

window.Components.models = () => ({
    init() {
        // Ensure data is fetched when this tab becomes active
        this.$watch('$store.global.activeTab', (val) => {
            if (val === 'models') {
                // Trigger recompute to ensure filters are applied
                this.$nextTick(() => {
                    Alpine.store('data').computeQuotaRows();
                });
            }
        });

        // Initial compute if already on models tab
        if (this.$store.global.activeTab === 'models') {
            this.$nextTick(() => {
                Alpine.store('data').computeQuotaRows();
            });
        }
    },

    /**
     * Update model configuration (Pin/Hide quick actions)
     * @param {string} modelId - The model ID to update
     * @param {object} configUpdates - Configuration updates (pinned, hidden)
     */
    async updateModelConfig(modelId, configUpdates) {
        const store = Alpine.store('global');
        try {
            const { response, newPassword } = await window.utils.request('/api/models/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ modelId, config: configUpdates })
            }, store.webuiPassword);

            if (newPassword) store.webuiPassword = newPassword;

            if (!response.ok) {
                throw new Error('Failed to update model config');
            }

            // Optimistic update
            Alpine.store('data').modelConfig[modelId] = {
                ...Alpine.store('data').modelConfig[modelId],
                ...configUpdates
            };
            Alpine.store('data').computeQuotaRows();
        } catch (e) {
            store.showToast('Failed to update: ' + e.message, 'error');
        }
    }
});
