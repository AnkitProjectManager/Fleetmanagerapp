import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import StatusBadge from "../shared/StatusBadge";
import { Building2, Truck, Calendar, FileText, CheckCircle } from "lucide-react";

export default function MechanicRequestDetails({ request, vehicle, fleet, open, onClose, onAssign }) {
  const queryClient = useQueryClient();
  const [workNotes, setWorkNotes] = useState(request.work_notes || "");

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.ServiceRequest.update(request.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allServiceRequests'] });
    },
  });

  const completeService = () => {
    updateMutation.mutate({
      status: 'completed',
      completed_date: new Date().toISOString(),
      work_notes: workNotes
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Service Request Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <StatusBadge status={request.status} />
                {request.priority !== 'normal' && (
                  <span className={`px-3 py-1 text-xs font-bold rounded uppercase ${
                    request.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                    request.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {request.priority}
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <Building2 className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="font-semibold text-blue-900">{fleet?.company_name}</p>
                    <p className="text-sm text-blue-700">{fleet?.contact_email}</p>
                    {fleet?.contact_phone && (
                      <p className="text-sm text-blue-700">{fleet?.contact_phone}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Truck className="w-5 h-5 text-gray-600 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {vehicle?.year} {vehicle?.make} {vehicle?.model}
                    </p>
                    <p className="text-sm text-gray-600">VIN: {vehicle?.vin}</p>
                    <p className="text-sm text-gray-600">License: {vehicle?.license_plate}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">Requested By</p>
                    <p className="font-medium">{request.requested_by}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Request Date</p>
                    <p className="font-medium">
                      {new Date(request.created_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {request.assigned_technician_name && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">Assigned to</p>
                    <p className="font-semibold text-green-900">{request.assigned_technician_name}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Requested Services</h3>
              </div>
              <div className="space-y-3">
                {request.requested_services?.map((service, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900">{service.service_name}</p>
                    {service.notes && (
                      <p className="text-sm text-gray-600 mt-1">{service.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {request.status !== 'waiting' && (
            <Card>
              <CardContent className="p-6">
                <Label className="mb-2 block">Work Notes</Label>
                <Textarea
                  value={workNotes}
                  onChange={(e) => setWorkNotes(e.target.value)}
                  placeholder="Add notes about the work performed..."
                  rows={4}
                />
                <Button
                  onClick={() => updateMutation.mutate({ work_notes: workNotes })}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  disabled={updateMutation.isLoading}
                >
                  Save Notes
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-3 pt-4">
            {request.status === 'waiting' && (
              <Button
                onClick={onAssign}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Assign Technician
              </Button>
            )}
            {request.status === 'in_progress' && (
              <Button
                onClick={completeService}
                className="bg-green-600 hover:bg-green-700"
                disabled={updateMutation.isLoading}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark as Completed
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}