import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Filter } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatusBadge from "../components/shared/StatusBadge";
import CreateServiceRequest from "../components/servicerequests/CreateServiceRequest";
import ServiceRequestDetails from "../components/servicerequests/ServiceRequestDetails";

export default function ServiceRequests() {
  const queryClient = useQueryClient();
  const [user, setUser] = React.useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  React.useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: serviceRequests, isLoading } = useQuery({
    queryKey: ['serviceRequests', user?.fleet_id],
    queryFn: () => base44.entities.ServiceRequest.filter({ fleet_id: user?.fleet_id }, '-created_date'),
    enabled: !!user?.fleet_id,
    initialData: [],
  });

  const { data: vehicles } = useQuery({
    queryKey: ['vehicles', user?.fleet_id],
    queryFn: () => base44.entities.Vehicle.filter({ fleet_id: user?.fleet_id }),
    enabled: !!user?.fleet_id,
    initialData: [],
  });

  const filteredRequests = statusFilter === "all" 
    ? serviceRequests 
    : serviceRequests.filter(r => r.status === statusFilter);

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Service Requests</h1>
            <p className="text-gray-500 mt-1">Track and manage service requests</p>
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </Button>
        </div>

        <Card className="mb-6 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-gray-400" />
              <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="waiting">Waiting</TabsTrigger>
                  <TabsTrigger value="in_progress">In Progress</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-24 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))
          ) : filteredRequests.length === 0 ? (
            <Card className="shadow-md">
              <CardContent className="p-12 text-center">
                <p className="text-gray-500 mb-4">
                  {statusFilter === "all" 
                    ? "No service requests yet. Create your first request!" 
                    : `No ${statusFilter} requests`}
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Request
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredRequests.map((request) => {
              const vehicle = vehicles.find(v => v.id === request.vehicle_id);
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
                            <span className="px-2 py-1 text-xs font-bold bg-red-100 text-red-700 rounded uppercase">
                              Urgent
                            </span>
                          )}
                          {request.priority === 'high' && (
                            <span className="px-2 py-1 text-xs font-bold bg-orange-100 text-orange-700 rounded uppercase">
                              High Priority
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {vehicle?.year} {vehicle?.make} {vehicle?.model}
                        </h3>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>VIN: {vehicle?.vin}</p>
                          <p>License: {vehicle?.license_plate}</p>
                          <p className="font-medium mt-2">
                            {request.requested_services?.length || 0} Service(s):
                          </p>
                          <ul className="list-disc list-inside ml-2">
                            {request.requested_services?.slice(0, 3).map((service, idx) => (
                              <li key={idx}>{service.service_name}</li>
                            ))}
                            {request.requested_services?.length > 3 && (
                              <li>+{request.requested_services.length - 3} more</li>
                            )}
                          </ul>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-xs text-gray-500 mb-2">
                          {new Date(request.created_date).toLocaleDateString()}
                        </p>
                        {request.assigned_technician_name && (
                          <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                            Tech: {request.assigned_technician_name}
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

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Service Request</DialogTitle>
            </DialogHeader>
            <CreateServiceRequest
              user={user}
              onClose={() => setShowCreateDialog(false)}
              onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ['serviceRequests'] });
                setShowCreateDialog(false);
              }}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Service Request Details</DialogTitle>
            </DialogHeader>
            {selectedRequest && (
              <ServiceRequestDetails
                request={selectedRequest}
                vehicle={vehicles.find(v => v.id === selectedRequest.vehicle_id)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}