import { useEffect, useState } from 'react';

interface ToastData {
  type: 'success' | 'error';
  message: string;
}

export default function Toast() {
  const [toast, setToast] = useState<ToastData | null>(null);

  useEffect(() => {
    const handleToast = (event: Event) => {
      const customEvent = event as CustomEvent<ToastData>;
      setToast(customEvent.detail);

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        setToast(null);
      }, 5000);
    };

    window.addEventListener('toast:show', handleToast);

    return () => {
      window.removeEventListener('toast:show', handleToast);
    };
  }, []);

  if (!toast) {
    return null;
  }

  const bgColor = toast.type === 'success' ? 'bg-green-500' : 'bg-red-500';

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div
        role="alert"
        className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-lg max-w-md`}
      >
        <div className="flex items-center gap-2">
          {toast.type === 'success' ? (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )}
          <p className="font-medium">{toast.message}</p>
        </div>
      </div>
    </div>
  );
}
