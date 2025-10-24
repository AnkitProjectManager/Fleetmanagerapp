import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Truck, FileText, Mail, Phone } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import StatusBadge from "../components/shared/StatusBadge";

export default function FleetClients() {
  const navigate = useNavigate();
  const [selectedFleet, setSelectedFleet] = useState(null);

  const { data: fleets, isLoading: fleetsLoading } = useQuery({
    queryKey: ['fleets'],
    queryFn: () => base44.entities.Fleet.list(),
    initialData: [],
  });

  const { data: vehicles } = useQuery({
    queryKey: ['allVehicles'],
    queryFn: () => base44.entities.Vehicle.list(),
    initialData: [],
  });

  const { data: administrators } = useQuery({
    queryKey: ['allAdministrators'],
    queryFn: () => base44.entities.Administrator.list(),
    initialData: [],
  });

  const { data: serviceRequests } = useQuery({
    queryKey: ['allServiceRequests'],
    queryFn: () => base44.entities.ServiceRequest.list('-created_date'),
    initialData: [],
  });

  const selectedFleetVehicles = selectedFleet 
    ? vehicles.filter(v => v.fleet_id === selectedFleet.id)
    : [];

  const selectedFleetAdmins = selectedFleet
    ? administrators.filter(a => a.fleet_id === selectedFleet.id)
    : [];

  const selectedFleetRequests = selectedFleet
    ? serviceRequests.filter(r => r.fleet_id === selectedFleet.id)
    : [];

  const outstandingRequests = selectedFleetRequests.filter(r => 
    r.status === 'waiting' || r.status === 'in_progress'
  );

  const completedRequests = selectedFleetRequests.filter(r => r.status === 'completed');

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Fleet Clients</h1>
          <p className="text-gray-500 mt-1">Manage your customer fleets</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div>
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  All Fleets
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {fleetsLoading ? (
                  <div className="p-4">Loading...</div>
                ) : fleets.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No fleet clients yet
                  </div>
                ) : (
                  <div className="divide-y">
                    {fleets.map((fleet) => (
                      <div
                        key={fleet.id}
                        onClick={() => setSelectedFleet(fleet)}
                        className={`p-4 cursor-pointer transition-colors ${
                          selectedFleet?.id === fleet.id
                            ? 'bg-blue-50 border-l-4 border-blue-600'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <p className="font-semibold text-gray-900">{fleet.company_name}</p>
                        <p className="text-sm text-gray-600 mt-1">{fleet.contact_email}</p>
                        <div className="flex gap-4 mt-2 text-xs text-gray-500">
                          <span>{vehicles.filter(v => v.fleet_id === fleet.id).length} vehicles</span>
                          <span>{serviceRequests.filter(r => r.fleet_id === fleet.id).length} requests</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            {!selectedFleet ? (
              <Card className="shadow-md">
                <CardContent className="p-12 text-center">
                  <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Select a fleet to view details</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <Card className="shadow-md">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <CardTitle className="text-2xl">{selectedFleet.company_name}</CardTitle>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {selectedFleet.contact_email}
                      </div>
                      {selectedFleet.contact_phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {selectedFleet.contact_phone}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-3xl font-bold text-blue-600">
                          {selectedFleetVehicles.length}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">Vehicles</p>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <p className="text-3xl font-bold text-yellow-600">
                          {outstandingRequests.length}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">Outstanding</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-3xl font-bold text-green-600">
                          {completedRequests.length}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">Completed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Tabs defaultValue="vehicles">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
                    <TabsTrigger value="requests">Service Requests</TabsTrigger>
                    <TabsTrigger value="admins">Administrators</TabsTrigger>
                  </TabsList>

                  <TabsContent value="vehicles" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Truck className="w-5 h-5" />
                          Fleet Vehicles ({selectedFleetVehicles.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedFleetVehicles.length === 0 ? (
                          <p className="text-center text-gray-500 py-8">No vehicles</p>
                        ) : (
                          <div className="space-y-3">
                            {selectedFleetVehicles.map((vehicle) => (
                              <div key={vehicle.id} className="p-4 border rounded-lg hover:bg-gray-50">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-semibold text-gray-900">
                                      {vehicle.year} {vehicle.make} {vehicle.model}
                                    </p>
                                    <p className="text-sm text-gray-600">VIN: {vehicle.vin}</p>
                                    <p className="text-sm text-gray-600">License: {vehicle.license_plate}</p>
                                  </div>
                                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                                    vehicle.status === 'active' ? 'bg-green-100 text-green-700' :
                                    vehicle.status === 'in_service' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {vehicle.status}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="requests" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          Service Requests ({selectedFleetRequests.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedFleetRequests.length === 0 ? (
                          <p className="text-center text-gray-500 py-8">No service requests</p>
                        ) : (
                          <div className="space-y-3">
                            {selectedFleetRequests.map((request) => {
                              const vehicle = vehicles.find(v => v.id === request.vehicle_id);
                              return (
                                <div
                                  key={request.id}
                                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                                  onClick={() => navigate(createPageUrl("MechanicDashboard"))}
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <StatusBadge status={request.status} />
                                    <span className="text-xs text-gray-500">
                                      {new Date(request.created_date).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="font-medium text-gray-900">
                                    {vehicle?.year} {vehicle?.make} {vehicle?.model}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {request.requested_services?.length || 0} service(s)
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="admins" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          Administrators ({selectedFleetAdmins.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedFleetAdmins.length === 0 ? (
                          <p className="text-center text-gray-500 py-8">No administrators</p>
                        ) : (
                          <div className="space-y-3">
                            {selectedFleetAdmins.map((admin) => (
                              <div key={admin.id} className="p-4 border rounded-lg">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="font-semibold text-gray-900">{admin.user_name}</p>
                                      {admin.is_primary && (
                                        <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                                          Primary
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-600">{admin.user_email}</p>
                                    {admin.phone && (
                                      <p className="text-sm text-gray-600">{admin.phone}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}