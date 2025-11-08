import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    bio: '',
    phone: '',
    organization: '',
    avatar_url: ''
  });
  const [permissions, setPermissions] = useState<any[]>([]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    await fetchProfile(user.id);
    await fetchPermissions(user.id);
  };

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
    } else if (data) {
      setProfile(data);
    }
    setLoading(false);
  };

  const fetchPermissions = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_event_permissions')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching permissions:', error);
    } else {
      setPermissions(data || []);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        ...profile,
        updated_at: new Date().toISOString()
      });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to save profile',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Success',
        description: 'Profile updated successfully'
      });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <h1 className="text-4xl font-bold mb-8">Settings</h1>

        <div className="space-y-6">
          {/* Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={profile.full_name || ''}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <Label htmlFor="organization">Organization</Label>
                <Input
                  id="organization"
                  value={profile.organization || ''}
                  onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
                  placeholder="Your organization or company"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={profile.phone || ''}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio || ''}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell us about yourself"
                  rows={4}
                />
              </div>

              <Button onClick={handleSave} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>

          {/* Event Permissions Section */}
          <Card>
            <CardHeader>
              <CardTitle>Event Permissions</CardTitle>
              <CardDescription>Your current event creation and management permissions</CardDescription>
            </CardHeader>
            <CardContent>
              {permissions.length === 0 ? (
                <p className="text-muted-foreground">No permissions assigned yet. Contact an administrator to get access.</p>
              ) : (
                <div className="space-y-3">
                  {permissions.map((perm) => (
                    <div key={perm.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium capitalize">{perm.event_category} Events</p>
                      </div>
                      <div className="flex gap-2">
                        {perm.can_create && <Badge variant="secondary">Can Create</Badge>}
                        {perm.can_manage && <Badge variant="secondary">Can Manage</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate('/manage-events')}
                variant="outline"
                className="w-full"
              >
                Manage All Events
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
