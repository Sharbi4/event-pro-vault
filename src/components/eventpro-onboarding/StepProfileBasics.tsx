import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Building2, FileText, Globe, Instagram, Info, Link2, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { ProfileBasicsData } from '@/hooks/useEventProOnboarding';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AvatarUpload } from '@/components/vendor-dashboard/AvatarUpload';
import { supabase } from '@/integrations/supabase/client';

interface StepProfileBasicsProps {
  data: ProfileBasicsData;
  onChange: (data: ProfileBasicsData) => void;
}

const MAX_BIO_LENGTH = 300;

export function StepProfileBasics({ data, onChange }: StepProfileBasicsProps) {
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid' | 'locked'>('idle');
  const [isUsernameLocked, setIsUsernameLocked] = useState(false);

  const updateField = <K extends keyof ProfileBasicsData>(
    field: K,
    value: ProfileBasicsData[K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  // Check if username is already locked (set in database)
  useEffect(() => {
    const checkIfLocked = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('user_id', user.id)
        .single();

      if (profile?.username) {
        setIsUsernameLocked(true);
        setUsernameStatus('locked');
      }
    };
    checkIfLocked();
  }, []);

  // Validate and check username availability
  useEffect(() => {
    if (isUsernameLocked) return;
    if (!data.username) {
      setUsernameStatus('idle');
      return;
    }

    // Validate format: lowercase, alphanumeric, hyphens, 3-30 chars
    const isValid = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/.test(data.username) && !data.username.includes('--');
    if (!isValid) {
      setUsernameStatus('invalid');
      return;
    }

    setUsernameStatus('checking');
    const timeout = setTimeout(async () => {
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', data.username)
        .maybeSingle();

      setUsernameStatus(existing ? 'taken' : 'available');
    }, 500);

    return () => clearTimeout(timeout);
  }, [data.username, isUsernameLocked]);

  const handleUsernameChange = (value: string) => {
    // Convert to lowercase, replace spaces with hyphens, remove invalid chars
    const sanitized = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    updateField('username', sanitized);
  };

  const bioLength = data.shortBio.length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center lg:text-left">
        <h2 className="font-display text-2xl font-bold mb-2">
          Tell us about yourself
        </h2>
        <p className="text-muted-foreground text-sm">
          This information will appear on your public profile
        </p>
      </div>

      {/* Profile Photo */}
      <Card variant="glass">
        <CardContent className="p-4 lg:p-6">
          <AvatarUpload
            currentAvatarUrl={data.avatarUrl || null}
            displayName={data.displayName || data.firstName || null}
            onUploadComplete={(url) => updateField('avatarUrl', url)}
          />
        </CardContent>
      </Card>

      {/* Name Fields */}
      <Card variant="glass">
        <CardContent className="p-4 lg:p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm">
                First Name
              </Label>
              <Input
                id="firstName"
                value={data.firstName}
                onChange={(e) => updateField('firstName', e.target.value)}
                placeholder="John"
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm">
                Last Name
              </Label>
              <Input
                id="lastName"
                value={data.lastName}
                onChange={(e) => updateField('lastName', e.target.value)}
                placeholder="Doe"
                className="h-12"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Display Name */}
      <Card variant="glass">
        <CardContent className="p-4 lg:p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-5 h-5 text-primary" />
            <span className="font-medium">Display Name / Business Name</span>
            <span className="text-destructive">*</span>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">This is how you'll appear in search results and on your profile</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <Input
            value={data.displayName}
            onChange={(e) => updateField('displayName', e.target.value)}
            placeholder="e.g. DJ Mike's Events, Chef Maria's Kitchen"
            className="h-12"
          />
        </CardContent>
      </Card>

      {/* Username / Public URL */}
      <Card variant="glass">
        <CardContent className="p-4 lg:p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Link2 className="w-5 h-5 text-primary" />
            <span className="font-medium">Public Profile URL</span>
            <span className="text-destructive">*</span>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  <strong>⚠️ Choose carefully!</strong> Your username becomes your permanent public URL and cannot be changed after you save it.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm shrink-0">eventpro.com/eventpro/</span>
              <div className="relative flex-1">
                <Input
                  value={data.username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  placeholder="your-username"
                  className="h-12 pr-10"
                  disabled={isUsernameLocked}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {usernameStatus === 'checking' && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                  {usernameStatus === 'available' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  {usernameStatus === 'taken' && <AlertCircle className="w-4 h-4 text-destructive" />}
                  {usernameStatus === 'invalid' && <AlertCircle className="w-4 h-4 text-amber-500" />}
                  {usernameStatus === 'locked' && <CheckCircle2 className="w-4 h-4 text-primary" />}
                </div>
              </div>
            </div>

            {/* Status Messages */}
            {usernameStatus === 'locked' && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Your username is set and cannot be changed
              </p>
            )}
            {usernameStatus === 'available' && (
              <p className="text-xs text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Username is available!
              </p>
            )}
            {usernameStatus === 'taken' && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                This username is already taken
              </p>
            )}
            {usernameStatus === 'invalid' && (
              <p className="text-xs text-amber-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                3-30 characters, lowercase letters, numbers, and hyphens only
              </p>
            )}
            {!isUsernameLocked && usernameStatus === 'idle' && (
              <p className="text-xs text-muted-foreground">
                ⚠️ <strong>This cannot be changed later.</strong> Choose a username that represents your brand.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bio */}
      <Card variant="glass">
        <CardContent className="p-4 lg:p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <span className="font-medium">Short Bio</span>
              <span className="text-destructive">*</span>
            </div>
            <span className={`text-xs ${bioLength > MAX_BIO_LENGTH ? 'text-destructive' : 'text-muted-foreground'}`}>
              {bioLength}/{MAX_BIO_LENGTH}
            </span>
          </div>

          <Textarea
            value={data.shortBio}
            onChange={(e) => updateField('shortBio', e.target.value.slice(0, MAX_BIO_LENGTH))}
            placeholder="Tell potential clients what makes you unique. What's your specialty? What experience do you bring?"
            className="min-h-[120px] resize-none"
          />
        </CardContent>
      </Card>

      {/* Optional Links */}
      <Card variant="glass">
        <CardContent className="p-4 lg:p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-5 h-5 text-primary" />
            <span className="font-medium">Links</span>
            <span className="text-xs text-muted-foreground">(optional but recommended)</span>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="website" className="text-sm text-muted-foreground">
                Website
              </Label>
              <Input
                id="website"
                type="url"
                value={data.websiteUrl}
                onChange={(e) => updateField('websiteUrl', e.target.value)}
                placeholder="https://yourwebsite.com"
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram" className="text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Instagram className="w-4 h-4" />
                  Instagram Handle
                </div>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                <Input
                  id="instagram"
                  value={data.instagramHandle}
                  onChange={(e) => updateField('instagramHandle', e.target.value.replace('@', ''))}
                  placeholder="yourusername"
                  className="h-12 pl-8"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
