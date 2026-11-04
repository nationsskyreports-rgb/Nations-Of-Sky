'use client';

import { useState } from 'react';
import { useToast } from '@/components/Toast';

// Runs a server action and tells the user whether it worked.
export default function ActionForm({ action, success = 'Saved', reset = false, className = '', children }) {
  const toast = useToast();
  const [pending, setPending] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (pending) return;

    const form = e.currentTarget;
    const submitter = e.nativeEvent.submitter;
    if (submitter?.dataset?.confirm && !window.confirm(submitter.dataset.confirm)) return;

    const data = new FormData(form);
    if (submitter?.name) data.set(submitter.name, submitter.value);

    setPending(true);
    try {
      const res = await action(data);
      if (res && res.ok === false) {
        toast(res.error || 'Something went wrong.', 'error');
      } else {
        toast((res && res.message) || success);
        if (reset) form.reset();
      }
    } catch {
      toast('Something went wrong. Please try again.', 'error');
    }
    setPending(false);
  };

  return (
    <form className={`${className}${pending ? ' is-pending' : ''}`} onSubmit={onSubmit}>
      {children}
    </form>
  );
}
