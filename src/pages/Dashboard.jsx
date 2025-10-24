import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Truck, FileText, Clock, CheckCircle, AlertCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatsCard from "../components/shared/StatsCard";
import StatusBadge from "../components/shared/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: vehicles, isLoading: vehiclesLoading } = useQuery({
    queryKey: ['vehicles', user?.fleet_id],
    queryFn: () => base44.entities.Vehicle.filter({ fleet_id: user?.fleet_id }),
    enabled: !!user?.fleet_id,
    initialData: [],
  });

  const { data: serviceRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ['serviceRequests', user?.fleet_id],
    queryFn: () => base44.entities.ServiceRequest.filter({ fleet_id: user?.fleet_id }, '-created_date'),
    enabled: !!user?.fleet_id,
    initialData: [],
  });

  const waitingRequests = serviceRequests.filter(r => r.status === 'waiting').length;
  const inProgressRequests = serviceRequests.filter(r => r.status === 'in_progress').length;
  const completedRequests = serviceRequests.filter(r => r.status === 'completed').length;

  const recentRequests = serviceRequests.slice(0, 5);

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fleet Dashboard</h1>
            <p className="text-gray-500 mt-1">Monitor your fleet service requests</p>
          </div>
          <Button
            onClick={() => navigate(createPageUrl("ServiceRequests"))}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Service Request
          </Button>
        </div>

        {vehiclesLoading || requestsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array(4).fill(0).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Vehicles"
              value={vehicles.length}
              icon={Truck}
              color="bg-blue-600"
              subtitle="In your fleet"
            />
            <StatsCard
              title="Waiting"
              value={waitingRequests}
              icon={Clock}
              color="bg-red-500"
              subtitle="Awaiting assignment"
            />
            <StatsCard
              title="In Progress"
              value={inProgressRequests}
              icon={AlertCircle}
              color="bg-yellow-500"
              subtitle="Being serviced"
            />
            <StatsCard
              title="Completed"
              value={completedRequests}
              icon={CheckCircle}
              color="bg-green-500"
              subtitle="This month"
            />
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="shadow-md">
              <CardHeader className="border-b bg-white">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Recent Service Requests
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {requestsLoading ? (
                  <div className="p-6 space-y-4">
                    {Array(3).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : recentRequests.length === 0 ? (
                  <div className="p-12 text-center">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No service requests yet</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => navigate(createPageUrl("ServiceRequests"))}
                    >
                      Create First Request
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y">
                    {recentRequests.map((request) => {
                      const vehicle = vehicles.find(v => v.id === request.vehicle_id);
                      return (
                        <div
                          key={request.id}
                          className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => navigate(createPageUrl("ServiceRequests"))}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <StatusBadge status={request.status} />
                                {request.priority === 'urgent' && (
                                  <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded">
                                    URGENT
                                  </span>
                                )}
                              </div>
                              <p className="font-semibold text-gray-900">
                                {vehicle?.year} {vehicle?.make} {vehicle?.model}
                              </p>
                              <p className="text-sm text-gray-500">VIN: {vehicle?.vin}</p>
                              <p className="text-sm text-gray-600 mt-1">
                                {request.requested_services?.length || 0} service(s) requested
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">
                                {new Date(request.created_date).toLocaleDateString()}
                              </p>
                              {request.assigned_technician_name && (
                                <p className="text-xs text-gray-600 mt-1">
                                  Tech: {request.assigned_technician_name}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="shadow-md">
              <CardHeader className="border-b bg-white">
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Fleet Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {vehiclesLoading ? (
                  <div className="space-y-4">
                    {Array(3).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : vehicles.length === 0 ? (
                  <div className="text-center py-8">
                    <Truck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No vehicles in fleet</p>
                    <Button
                      variant="outline"
                      onClick={() => navigate(createPageUrl("Vehicles"))}
                    >
                      Add Vehicles
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Active Vehicles</span>
                      <span className="text-xl font-bold text-gray-900">
                        {vehicles.filter(v => v.status === 'active').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">In Service</span>
                      <span className="text-xl font-bold text-yellow-600">
                        {vehicles.filter(v => v.status === 'in_service').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Inactive</span>
                      <span className="text-xl font-bold text-gray-400">
                        {vehicles.filter(v => v.status === 'inactive').length}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => navigate(createPageUrl("Vehicles"))}
                    >
                      View All Vehicles
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}