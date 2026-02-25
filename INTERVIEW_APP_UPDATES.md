# Interview App Updates Required for Multi-Attempt Support

## Overview
The dashboard now supports multi-attempt interview tracking. The interview app needs to be updated to populate the new database fields when creating/updating interview sessions.

## Database Schema Changes
The `interview_sessions` table now has these additional columns:
- `job_id` (uuid, foreign key to jobs table)
- `attempt_number` (integer, default 1)
- `transcript` (jsonb array)
- `recommendations` (jsonb array)

## Required Updates in Interview App

### 1. When Creating Interview Session

The interview app receives `job_id` in the `session_claims` from the exchange endpoint. When creating the `interview_sessions` record, include:

```typescript
// Example interview session creation
const { data, error } = await supabase
  .from('interview_sessions')
  .insert({
    id: interview_id,  // from session_claims
    user_id: user_id,  // from session_claims
    job_id: job_id,    // ✅ NEW: from session_claims
    resume_file_id: resume_id,
    attempt_number: await getNextAttemptNumber(job_id, user_id), // ✅ NEW
    mode: 'general',
    status: 'created',
    // ... other fields
  })
  .single();
```

### 2. Calculate Attempt Number

Before inserting, query for the highest existing attempt number for this job + user:

```typescript
async function getNextAttemptNumber(jobId: string, userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('interview_sessions')
    .select('attempt_number')
    .eq('job_id', jobId)
    .eq('user_id', userId)
    .order('attempt_number', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching attempt number:', error);
    return 1; // Default to 1 on error
  }

  return data ? data.attempt_number + 1 : 1;
}
```

### 3. Save Transcript

Store the full conversation as a JSONB array:

```typescript
// Structure: array of exchange objects
const transcript = [
  {
    speaker: 'ai',
    message: 'Let\'s start with your background...',
    timestamp: '2026-02-25T10:15:30Z'
  },
  {
    speaker: 'user',
    message: 'I have 5 years of experience...',
    timestamp: '2026-02-25T10:15:45Z'
  },
  // ... more exchanges
];

// Update the interview session
await supabase
  .from('interview_sessions')
  .update({ transcript })
  .eq('id', interview_id);
```

### 4. Save Recommendations

Store recommendations as a JSONB array with type and text:

```typescript
// Structure: array of recommendation objects
const recommendations = [
  {
    type: 'improve',
    text: 'Structure behavioral answers using STAR format. Your production incident answer jumped between context and result without a clear timeline.'
  },
  {
    type: 'improve',
    text: 'Quantify your impact — instead of "improved performance," say "reduced p99 latency from 800ms to 120ms."'
  },
  {
    type: 'strength',
    text: 'Strong articulation of Elixir concurrency model and its applicability to high-volume payroll processing.'
  }
];

// Update the interview session
await supabase
  .from('interview_sessions')
  .update({ recommendations })
  .eq('id', interview_id);
```

## Field Mappings

### Transcript Format
```typescript
type TranscriptExchange = {
  speaker: 'ai' | 'user';
  message: string;
  timestamp?: string;
};

type Transcript = TranscriptExchange[];
```

### Recommendations Format
```typescript
type Recommendation = {
  type: 'improve' | 'strength' | 'refine';
  text: string;
};

type Recommendations = Recommendation[];
```

## Performance Scoring Fields (Existing)

These fields already exist and should continue to be populated:
- `performance_overall_score` (0-100)
- `question_understanding_score` (0-100)
- `answer_correctness_score` (0-100)
- `reasoning_quality_score` (0-100)
- `followup_depth_score` (0-100)
- `communication_clarity_score` (0-100)
- `behavioral_story_quality_score` (0-100)
- `role_alignment_coverage_score` (0-100)
- `confidence_calibration_score` (0-100)
- `time_management_score` (0-100)
- `recovery_ability_score` (0-100)
- `performance_strengths` (jsonb array of strings)
- `performance_growth_areas` (jsonb array of strings)
- `performance_next_steps` (jsonb array of strings)
- `performance_status` ('pending' | 'ready' | 'failed')

## Migration

Run the migration on the database:
```bash
# In the nayld dashboard repo
supabase db push
```

Or apply the migration manually:
```sql
-- File: supabase/migrations/20260225000000_add_multi_attempt_support_to_interviews.sql
-- (see file for full migration)
```

## Testing Checklist

- [ ] Interview sessions are created with `job_id` from session_claims
- [ ] `attempt_number` is calculated correctly (1 for first, 2 for second, etc.)
- [ ] Transcript is saved as JSONB array with proper structure
- [ ] Recommendations are saved as JSONB array with proper structure
- [ ] All existing performance metrics continue to work
- [ ] Multiple interviews for the same job create separate records with incrementing attempt_number
- [ ] The unique constraint `(job_id, user_id, attempt_number)` prevents duplicate attempts

## Dashboard Integration

The dashboard (nayld repo) now has query helpers in `lib/queries/interviews.ts`:
- `getInterviewsForJob()` - fetch all interviews for a job
- `getLatestInterviewForJob()` - fetch most recent interview
- `getNextAttemptNumber()` - get next attempt number (for reference)
- `getInterviewById()` - fetch single interview with validation

The job details page will use these to display:
- Interview history with progress chart
- Attempt comparison table
- Individual attempt results with recommendations and transcript
