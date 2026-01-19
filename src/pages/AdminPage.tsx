import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Settings, Workflow, Database } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdminWorkflowForm } from "@/components/AdminWorkflowForm";

const AdminPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [workflows, setWorkflows] = useState<any[]>([]);

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        navigate('/auth');
        return;
      }

      setUser(session.user);

      // Check if user has admin role
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .single();

      if (!roles) {
        navigate('/dashboard');
        toast.error("Access denied. Admin privileges required.");
        return;
      }

      setIsAdmin(true);
      await loadWorkflowData();
    };

    checkAuthAndLoadData();
  }, [navigate]);

  const loadWorkflowData = async () => {
    try {
      // Load recent workflow executions or job data
      const { data: jobs } = await supabase
        .from('lead_extraction_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      setWorkflows(jobs || []);
    } catch (error) {
      console.error('Error loading workflow data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
    toast.success("Logged out successfully");
  };

  const handleWorkflowTriggered = () => {
    loadWorkflowData();
    toast.success("Workflow triggered successfully");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Workflow management and system administration
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
              <Workflow className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workflows.length}</div>
              <p className="text-xs text-muted-foreground">
                Recent executions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {workflows.filter(w => w.status === 'pending' || w.status === 'running').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently processing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Online</div>
              <p className="text-xs text-muted-foreground">
                All systems operational
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="workflow" className="space-y-6">
          <TabsList>
            <TabsTrigger value="workflow">Trigger Workflow</TabsTrigger>
            <TabsTrigger value="jobs">Recent Jobs</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="workflow" className="space-y-6">
            <AdminWorkflowForm onWorkflowTriggered={handleWorkflowTriggered} />
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Workflow Executions</CardTitle>
                <CardDescription>
                  View the latest n8n workflow executions and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {workflows.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No workflow executions found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {workflows.map((workflow) => (
                      <div key={workflow.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{workflow.keyword} - {workflow.country}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(workflow.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            workflow.status === 'completed' ? 'bg-green-100 text-green-800' :
                            workflow.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            workflow.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {workflow.status}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {workflow.processed_leads || 0} leads
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>
                  Configure n8n workflow endpoints and system parameters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">n8n Webhook Endpoints</h4>
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm font-mono">
                        https://your-n8n-instance.com/webhook/maps-extraction
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Configuration</h4>
                    <p className="text-sm text-muted-foreground">
                      Webhook URLs and API keys are managed through environment variables.
                      Contact system administrator for configuration changes.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPage;