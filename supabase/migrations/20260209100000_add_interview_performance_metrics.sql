begin;

alter table public.interview_sessions
  add column question_understanding_score smallint,
  add column answer_correctness_score smallint,
  add column reasoning_quality_score smallint,
  add column followup_depth_score smallint,
  add column communication_clarity_score smallint,
  add column behavioral_story_quality_score smallint,
  add column role_alignment_coverage_score smallint,
  add column confidence_calibration_score smallint,
  add column time_management_score smallint,
  add column recovery_ability_score smallint,
  add column performance_overall_score smallint,
  add column performance_feedback jsonb,
  add column performance_strengths jsonb,
  add column performance_growth_areas jsonb,
  add column performance_next_steps jsonb,
  add column performance_status text,
  add column performance_version text,
  add column performance_error text,
  add column performance_updated_at timestamptz;

alter table public.interview_sessions
  add constraint interview_sessions_performance_score_range
  check (
    (question_understanding_score is null or (question_understanding_score >= 0 and question_understanding_score <= 100)) and
    (answer_correctness_score is null or (answer_correctness_score >= 0 and answer_correctness_score <= 100)) and
    (reasoning_quality_score is null or (reasoning_quality_score >= 0 and reasoning_quality_score <= 100)) and
    (followup_depth_score is null or (followup_depth_score >= 0 and followup_depth_score <= 100)) and
    (communication_clarity_score is null or (communication_clarity_score >= 0 and communication_clarity_score <= 100)) and
    (behavioral_story_quality_score is null or (behavioral_story_quality_score >= 0 and behavioral_story_quality_score <= 100)) and
    (role_alignment_coverage_score is null or (role_alignment_coverage_score >= 0 and role_alignment_coverage_score <= 100)) and
    (confidence_calibration_score is null or (confidence_calibration_score >= 0 and confidence_calibration_score <= 100)) and
    (time_management_score is null or (time_management_score >= 0 and time_management_score <= 100)) and
    (recovery_ability_score is null or (recovery_ability_score >= 0 and recovery_ability_score <= 100)) and
    (performance_overall_score is null or (performance_overall_score >= 0 and performance_overall_score <= 100))
  );

alter table public.interview_sessions
  add constraint interview_sessions_performance_status_values
  check (
    performance_status is null or
    performance_status in ('pending', 'ready', 'failed')
  );

alter table public.interview_sessions
  add constraint interview_sessions_performance_feedback_is_object
  check (
    performance_feedback is null or
    jsonb_typeof(performance_feedback) = 'object'
  );

alter table public.interview_sessions
  add constraint interview_sessions_performance_strengths_is_array
  check (
    performance_strengths is null or
    jsonb_typeof(performance_strengths) = 'array'
  );

alter table public.interview_sessions
  add constraint interview_sessions_performance_growth_areas_is_array
  check (
    performance_growth_areas is null or
    jsonb_typeof(performance_growth_areas) = 'array'
  );

alter table public.interview_sessions
  add constraint interview_sessions_performance_next_steps_is_array
  check (
    performance_next_steps is null or
    jsonb_typeof(performance_next_steps) = 'array'
  );

commit;
