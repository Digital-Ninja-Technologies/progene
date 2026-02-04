import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bell, 
  Eye, 
  PenLine, 
  Clock,
  FileText,
  Loader2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Activity {
  id: string;
  type: "view" | "sign";
  proposalId: string;
  projectType: string;
  timestamp: string;
  clientSignature?: string;
}

export function NotificationCenter() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    setLoading(true);

    // Fetch user's proposals
    const { data: proposals, error: proposalsError } = await supabase
      .from("proposals")
      .select("id, project_type, client_signed_at, client_signature");

    if (proposalsError || !proposals) {
      setLoading(false);
      return;
    }

    const proposalMap = new Map(
      proposals.map((p) => [p.id, { projectType: p.project_type, clientSignature: p.client_signature }])
    );
    const proposalIds = proposals.map((p) => p.id);

    if (proposalIds.length === 0) {
      setLoading(false);
      return;
    }

    // Fetch views for all proposals
    const { data: views, error: viewsError } = await supabase
      .from("proposal_views")
      .select("id, proposal_id, viewed_at")
      .in("proposal_id", proposalIds)
      .order("viewed_at", { ascending: false })
      .limit(50);

    const activityList: Activity[] = [];

    // Add views
    if (!viewsError && views) {
      views.forEach((view) => {
        const proposal = proposalMap.get(view.proposal_id);
        if (proposal) {
          activityList.push({
            id: `view-${view.id}`,
            type: "view",
            proposalId: view.proposal_id,
            projectType: proposal.projectType,
            timestamp: view.viewed_at,
          });
        }
      });
    }

    // Add signatures
    proposals.forEach((p) => {
      if (p.client_signed_at) {
        activityList.push({
          id: `sign-${p.id}`,
          type: "sign",
          proposalId: p.id,
          projectType: p.project_type,
          timestamp: p.client_signed_at,
          clientSignature: p.client_signature || undefined,
        });
      }
    });

    // Sort by timestamp descending
    activityList.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    setActivities(activityList.slice(0, 20));
    setLoading(false);
  };

  const getActivityIcon = (type: "view" | "sign") => {
    if (type === "view") {
      return <Eye className="h-4 w-4 text-blue-500" />;
    }
    return <PenLine className="h-4 w-4 text-green-500" />;
  };

  const getActivityText = (activity: Activity) => {
    if (activity.type === "view") {
      return (
        <span>
          Someone viewed your <strong>{activity.projectType}</strong> proposal
        </span>
      );
    }
    return (
      <span>
        {activity.clientSignature ? (
          <>
            <strong>{activity.clientSignature}</strong> signed your{" "}
          </>
        ) : (
          "Your "
        )}
        <strong>{activity.projectType}</strong> proposal
        {!activity.clientSignature && " was signed"}
      </span>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          {activities.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activities.length} events
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No activity yet</p>
            <p className="text-xs mt-1">
              Share your proposals to see views and signatures here
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="mt-0.5 p-1.5 rounded-full bg-background">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{getActivityText(activity)}</p>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(activity.timestamp), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                  <Badge
                    variant={activity.type === "sign" ? "default" : "outline"}
                    className={`text-xs shrink-0 ${
                      activity.type === "sign"
                        ? "bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20"
                        : ""
                    }`}
                  >
                    {activity.type === "view" ? "Viewed" : "Signed"}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
