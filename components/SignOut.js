'use client';

import { signOut } from '@/app/auth-actions';

export default function SignOut() {
  return (
    <form action={signOut}>
      <button className="d-link" type="submit">
        Sign out
      </button>
    </form>
  );
}
