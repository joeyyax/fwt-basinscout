import { registerComponent } from '../utils/components.js';

/**
 * ErrorModal Component
 *
 * A modal dialog that displays content loading errors with retry functionality
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {string} props.title - Modal title
 * @param {string} props.message - Error message to display
 * @param {Error} props.error - The actual error object
 * @param {Function} props.onRetry - Callback for retry button
 * @param {Function} props.onClose - Callback for close button
 */
export function ErrorModal({
  isOpen = false,
  title = 'Content Loading Error',
  message = "We're having trouble loading the latest content. This might be due to a temporary connection issue.",
  error,
  onRetry,
  onClose,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 pb-0">
          <div className="flex items-center justify-between">
            <h3 className="text-lg !text-white font-semibold text-white !mb-0 !pb-0">
              {title}
            </h3>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <div className="flex items-start space-x-3">
            <div className="flex-1">
              <p className="text-white/90 leading-relaxed mb-3">{message}</p>
              {error && (
                <details className="mt-3">
                  <summary className="text-white/70 text-sm cursor-pointer hover:text-white/90 transition-colors">
                    Technical Details
                  </summary>
                  <div className="mt-2 p-3 bg-black/20 rounded border border-white/10 text-xs font-mono text-white/80">
                    <strong>Error:</strong> {error.message || 'Unknown error'}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/20 flex justify-end space-x-3">
          {onRetry && (
            <button onClick={onRetry} className="btn btn-primary">
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Register component for CMS export
registerComponent('ErrorModal', ErrorModal, {
  name: 'Error Modal',
  description: 'A modal dialog for displaying content loading errors',
  fields: {
    isOpen: {
      type: 'boolean',
      label: 'Is Open',
      defaultValue: false,
    },
    title: {
      type: 'text',
      label: 'Title',
      defaultValue: 'Content Loading Error',
    },
    message: {
      type: 'textarea',
      label: 'Message',
      defaultValue:
        "We're having trouble loading the latest content. This might be due to a temporary connection issue.",
    },
  },
});
