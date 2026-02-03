import { DollarSign, Eye, FileText, CheckCircle, TrendingUp, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAnalytics } from "@/hooks/useAnalytics";

export function AnalyticsDashboard() {
  const { revenueStats, proposalStats, loading } = useAnalytics();

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading analytics...</div>;
  }

  const conversionRate = revenueStats.proposalCount > 0 
    ? ((revenueStats.signedCount / revenueStats.proposalCount) * 100).toFixed(1)
    : "0";

  const totalViews = proposalStats.reduce((sum, s) => sum + s.viewCount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Analytics Dashboard</h3>
        <p className="text-sm text-muted-foreground">
          Track your proposal performance and revenue
        </p>
      </div>

      {/* Revenue Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Pipeline Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              ${revenueStats.totalValue.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {revenueStats.proposalCount} proposals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Signed Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              ${revenueStats.signedValue.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {revenueStats.signedCount} signed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{conversionRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">
              signed / total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Total Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalViews}</p>
            <p className="text-xs text-muted-foreground mt-1">
              across all proposals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Breakdown */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4" />
              Pipeline Breakdown
            </CardTitle>
            <CardDescription>Value by status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pending</span>
                <span className="font-medium">${revenueStats.pendingValue.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-500 rounded-full transition-all"
                  style={{ 
                    width: revenueStats.totalValue > 0 
                      ? `${(revenueStats.pendingValue / revenueStats.totalValue) * 100}%` 
                      : "0%" 
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Signed</span>
                <span className="font-medium">${revenueStats.signedValue.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ 
                    width: revenueStats.totalValue > 0 
                      ? `${(revenueStats.signedValue / revenueStats.totalValue) * 100}%` 
                      : "0%" 
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Eye className="h-4 w-4" />
              Proposal Engagement
            </CardTitle>
            <CardDescription>Views per proposal</CardDescription>
          </CardHeader>
          <CardContent>
            {proposalStats.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <FileText className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">No proposal views yet</p>
                <p className="text-xs mt-1">Share proposals to track engagement</p>
              </div>
            ) : (
              <div className="space-y-3">
                {proposalStats
                  .sort((a, b) => b.viewCount - a.viewCount)
                  .slice(0, 5)
                  .map((stat, index) => (
                    <div key={stat.proposalId} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                          {index + 1}
                        </span>
                        <span className="text-sm truncate max-w-[150px]">
                          Proposal #{stat.proposalId.slice(0, 8)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium">{stat.viewCount}</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
