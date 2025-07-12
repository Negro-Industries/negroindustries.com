'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';

interface FormState {
  success: boolean;
  message: string;
}

async function manageRepository(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const action = formData.get('action') as string;
  const owner = formData.get('owner') as string;
  const repo = formData.get('repo') as string;

  // Validate input
  if (!action || !owner || !repo) {
    return {
      success: false,
      message: 'All fields are required',
    };
  }

  if (!['add', 'remove'].includes(action)) {
    return {
      success: false,
      message: 'Action must be either "add" or "remove"',
    };
  }

  try {
    const response = await fetch(
      'https://cloudflare-worker-telegram-bot.jbwashington.workers.dev/manage-repos',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          owner,
          repo,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        message: `Failed to ${action} repository: ${errorText}`,
      };
    }

    await response.json();
    return {
      success: true,
      message: `Successfully ${
        action === 'add' ? 'added' : 'removed'
      } repository ${owner}/${repo}`,
    };
  } catch (error) {
    console.error('Error managing repository:', error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.',
    };
  }
}

const initialState: FormState = {
  success: false,
  message: '',
};

export function RepoManagementForm() {
  const [state, formAction, pending] = useActionState(
    manageRepository,
    initialState
  );

  return (
    <form action={formAction} className='space-y-4'>
      <div>
        <label htmlFor='action' className='block text-sm font-medium mb-1'>
          Action
        </label>
        <select
          id='action'
          name='action'
          required
          className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
        >
          <option value=''>Select action...</option>
          <option value='add'>Add Repository</option>
          <option value='remove'>Remove Repository</option>
        </select>
      </div>

      <div>
        <label htmlFor='owner' className='block text-sm font-medium mb-1'>
          GitHub Username/Owner
        </label>
        <input
          type='text'
          id='owner'
          name='owner'
          required
          placeholder='e.g., octocat'
          className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
        />
      </div>

      <div>
        <label htmlFor='repo' className='block text-sm font-medium mb-1'>
          Repository Name
        </label>
        <input
          type='text'
          id='repo'
          name='repo'
          required
          placeholder='e.g., my-awesome-repo'
          className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
        />
      </div>

      {state?.message && (
        <div
          className={`p-3 rounded-md text-sm ${
            state.success
              ? 'bg-green-50 text-green-800 border border-green-200 dark:bg-green-950 dark:text-green-200 dark:border-green-800'
              : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-800'
          }`}
          aria-live='polite'
        >
          {state.message}
        </div>
      )}

      <Button type='submit' disabled={pending} className='w-full'>
        {pending ? 'Processing...' : 'Manage Repository'}
      </Button>
    </form>
  );
}
