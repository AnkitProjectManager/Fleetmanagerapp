import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";
import StatsCard from "../components/shared/StatsCard";
import StatusBadge from "../components/shared/StatusBadge";
import AssignTechnicianDialog from "../components/mechanic/AssignTechnicianDialog";
import MechanicRequestDetails from "../components/mechanic/MechanicRequestDetails";
import { Skeleton } from "@/components/ui/skeleton";

export default function MechanicDashboard() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showAssignDialog, setShowAssignDialog] = useState(false);

  const { data: serviceRequests, isLoading } = useQuery({
    queryKey: ['allServiceRequests'],
    queryFn: () => base44.entities.ServiceRequest.list('-created_date'),
    initialData: [],
  });

  const { data: vehicles } = useQuery({
    queryKey: ['allVehicles'],
    queryFn: () => base44.entities.Vehicle.list(),
    initialData: [],
  });

  const { data: fleets } = useQuery({
    queryKey: ['fleets'],
    queryFn: () => base44.entities.Fleet.list(),
    initialData: [],
  });

  const waitingRequests = serviceRequests.filter(r => r.status === 'waiting').length;
  const inProgressRequests = serviceRequests.filter(r => r.status === 'in_progress').length;
  const completedToday = serviceRequests.filter(r => {
    if (r.status !== 'completed') return false;
    const today = new Date().toDateString();
    return new Date(r.completed_date).toDateString() === today;
  }).length;

  const filteredRequests = statusFilter === "all" 
    ? serviceRequests 
    : serviceRequests.filter(r => r.status === statusFilter);

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
    if (b.priority === 'urgent' && a.priority !== 'urgent') return 1;
    if (a.priority === 'high' && b.priority !== 'high') return -1;
    if (b.priority === 'high' && a.priority !== 'high') return 1;
    return new Date(a.created_date) - new Date(b.created_date);
  });

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-gray-50 to-purple-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Service Queue</h1>
          <p className="text-gray-500 mt-1">Manage all incoming service requests</p>
        </div>

        {isLoading ? (
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
              title="Total Requests"
              value={serviceRequests.length}
              icon={FileText}
              color="bg-purple-600"
              subtitle="All time"
            />
            <StatsCard
              title="Waiting"
              value={waitingRequests}
              icon={Clock}
              color="bg-red-500"
              subtitle="Needs assignment"
            />
            <StatsCard
              title="In Progress"
              value={inProgressRequests}
              icon={AlertCircle}
              color="bg-yellow-500"
              subtitle="Active jobs"
            />
            <StatsCard
              title="Completed Today"
              value={completedToday}
              icon={CheckCircle}
              color="bg-green-500"
            />
          </div>
        )}

        <Card className="mb-6 shadow-md">
          <CardContent className="p-4">
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList>
                <TabsTrigger value="all">All ({serviceRequests.length})</TabsTrigger>
                <TabsTrigger value="waiting">Waiting ({waitingRequests})</TabsTrigger>
                <TabsTrigger value="in_progress">In Progress ({inProgressRequests})</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-32 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))
          ) : sortedRequests.length === 0 ? (
            <Card className="shadow-md">
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {statusFilter === "all" 
                    ? "No service requests yet" 
                    : `No ${statusFilter} requests`}
                </p>
              </CardContent>
            </Card>
          ) : (
            sortedRequests.map((request) => {
              const vehicle = vehicles.find(v => v.id === request.vehicle_id);
              const fleet = fleets.find(f => f.id === request.fleet_id);
              return (
                <Card
                  key={request.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedRequest(request)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <StatusBadge status={request.status} />
                          {request.priority === 'urgent' && (
                            <span className="px-2 py-1 text-xs font-bold bg-red-100 text-red-700 rounded uppercase animate-pulse">
                              🚨 Urgent
                            </span>
                          )}
                          {request.priority === 'high' && (
                            <span className="px-2 py-1 text-xs font-bold bg-orange-100 text-orange-700 rounded uppercase">
                              High Priority
                            </span>
                          )}
                        </div>
                        <div className="mb-3">
                          <p className="text-sm font-medium text-blue-600 mb-1">
                            {fleet?.company_name}
                          </p>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {vehicle?.year} {vehicle?.make} {vehicle?.model}
                          </h3>
                          <p className="text-sm text-gray-600">
                            VIN: {vehicle?.vin} | License: {vehicle?.license_plate}
                          </p>
                        </div>
                        <div className="text-sm text-gray-700">
                          <p className="font-medium mb-1">
                            {request.requested_services?.length || 0} Service(s):
                          </p>
                          <ul className="list-disc list-inside ml-2 space-y-1">
                            {request.requested_services?.slice(0, 3).map((service, idx) => (
                              <li key={idx}>{service.service_name}</li>
                            ))}
                            {request.requested_services?.length > 3 && (
                              <li className="text-blue-600">+{request.requested_services.length - 3} more</li>
                            )}
                          </ul>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-xs text-gray-500 mb-2">
                          {new Date(request.created_date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500 mb-3">
                          {Math.floor((Date.now() - new Date(request.created_date)) / (1000 * 60 * 60))}h ago
                        </p>
                        {request.status === 'waiting' && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRequest(request);
                              setShowAssignDialog(true);
                            }}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Assign Tech
                          </Button>
                        )}
                        {request.assigned_technician_name && (
                          <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded mt-2">
                            {request.assigned_technician_name}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {selectedRequest && (
          <MechanicRequestDetails
            request={selectedRequest}
            vehicle={vehicles.find(v => v.id === selectedRequest.vehicle_id)}
            fleet={fleets.find(f => f.id === selectedRequest.fleet_id)}
            open={!!selectedRequest && !showAssignDialog}
            onClose={() => setSelectedRequest(null)}
            onAssign={() => setShowAssignDialog(true)}
          />
        )}

        {selectedRequest && showAssignDialog && (
          <AssignTechnicianDialog
            request={selectedRequest}
            open={showAssignDialog}
            onClose={() => {
              setShowAssignDialog(false);
              setSelectedRequest(null);
            }}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['allServiceRequests'] });
              setShowAssignDialog(false);
              setSelectedRequest(null);
            }}
          />
        )}
      </div>
    </div>
  );
}