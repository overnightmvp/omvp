-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES TABLE
-- =====================================================
-- Extends auth.users with custom profile fields

CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  handle TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Indexes
CREATE INDEX idx_profiles_id ON public.profiles(id);

-- =====================================================
-- QUIZ RESPONSES TABLE
-- =====================================================
-- Stores user's quiz answers and calculated authority score

CREATE TABLE public.quiz_responses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Step 1: Identity
  name TEXT NOT NULL,
  handle TEXT,

  -- Step 2-3: Platforms
  primary_platform TEXT NOT NULL,
  secondary_channels TEXT[] DEFAULT '{}',

  -- Step 4: Niche
  niche TEXT NOT NULL,
  niche_category TEXT,

  -- Step 5: Offers
  offers TEXT[] DEFAULT '{}',

  -- Step 6: Current Presence
  google_presence TEXT,
  ai_presence TEXT,
  website_status TEXT,

  -- Step 7: Brand Direction
  brand_tones TEXT[] DEFAULT '{}',

  -- Step 8: Anti-Vision
  anti_vision TEXT[] DEFAULT '{}',
  anti_custom TEXT,

  -- Step 9: Readiness
  blocker TEXT,
  timeline TEXT,
  context TEXT,

  -- Calculated
  authority_score INTEGER NOT NULL CHECK (authority_score >= 0 AND authority_score <= 100),

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(user_id) -- One quiz response per user
);

-- Enable RLS
ALTER TABLE public.quiz_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quiz_responses
CREATE POLICY "Users can view own quiz responses"
  ON public.quiz_responses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz responses"
  ON public.quiz_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quiz responses"
  ON public.quiz_responses FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_quiz_responses_user_id ON public.quiz_responses(user_id);
CREATE INDEX idx_quiz_responses_authority_score ON public.quiz_responses(authority_score);

-- =====================================================
-- YOUTUBE CONNECTIONS TABLE
-- =====================================================
-- Stores YouTube OAuth tokens and channel metadata

CREATE TABLE public.youtube_connections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  channel_id TEXT NOT NULL,
  channel_name TEXT NOT NULL,
  channel_url TEXT,
  channel_subscriber_count INTEGER,

  -- OAuth tokens (encrypt in production)
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,

  connected_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_synced_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(user_id) -- One YouTube connection per user
);

-- Enable RLS
ALTER TABLE public.youtube_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for youtube_connections
CREATE POLICY "Users can view own YouTube connection"
  ON public.youtube_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own YouTube connection"
  ON public.youtube_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own YouTube connection"
  ON public.youtube_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own YouTube connection"
  ON public.youtube_connections FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_youtube_connections_user_id ON public.youtube_connections(user_id);
CREATE INDEX idx_youtube_connections_channel_id ON public.youtube_connections(channel_id);

-- =====================================================
-- OAUTH STATES TABLE
-- =====================================================
-- Stores OAuth state tokens for CSRF protection

CREATE TABLE public.oauth_states (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  state TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.oauth_states ENABLE ROW LEVEL SECURITY;

-- RLS Policies for oauth_states
CREATE POLICY "Users can view own OAuth states"
  ON public.oauth_states FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own OAuth states"
  ON public.oauth_states FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own OAuth states"
  ON public.oauth_states FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_oauth_states_user_id ON public.oauth_states(user_id);
CREATE INDEX idx_oauth_states_state ON public.oauth_states(state);
CREATE INDEX idx_oauth_states_expires_at ON public.oauth_states(expires_at);

-- =====================================================
-- GENERATION QUEUE TABLE
-- =====================================================
-- Manages page generation job queue

CREATE TABLE public.generation_queue (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  video_id TEXT NOT NULL,
  video_title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  video_description TEXT,

  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'published', 'failed')),

  priority INTEGER DEFAULT 0 NOT NULL, -- Higher = more urgent
  error_message TEXT,
  retry_count INTEGER DEFAULT 0 NOT NULL,

  queued_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.generation_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for generation_queue
CREATE POLICY "Users can view own queue items"
  ON public.generation_queue FOR SELECT
  USING (auth.uid() = user_id);

-- Indexes for efficient queue processing
CREATE INDEX idx_generation_queue_status_priority ON public.generation_queue(status, priority DESC, queued_at ASC);
CREATE INDEX idx_generation_queue_user_id ON public.generation_queue(user_id);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quiz_responses_updated_at
  BEFORE UPDATE ON public.quiz_responses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_youtube_connections_updated_at
  BEFORE UPDATE ON public.youtube_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generation_queue_updated_at
  BEFORE UPDATE ON public.generation_queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, handle)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NULL),
    COALESCE(NEW.raw_user_meta_data->>'handle', NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to clean up expired OAuth states (run via cron)
CREATE OR REPLACE FUNCTION public.cleanup_expired_oauth_states()
RETURNS void AS $$
BEGIN
  DELETE FROM public.oauth_states
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE public.profiles IS 'User profile data extending auth.users';
COMMENT ON TABLE public.quiz_responses IS 'Authority quiz responses and calculated scores';
COMMENT ON TABLE public.youtube_connections IS 'YouTube OAuth tokens and channel metadata';
COMMENT ON TABLE public.oauth_states IS 'OAuth state tokens for CSRF protection';
COMMENT ON TABLE public.generation_queue IS 'Page generation job queue';
