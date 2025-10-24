import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import StatusBadge from "../shared/StatusBadge";
import { Calendar, User, Wrench } from "lucide-react";

export default function ServiceRequestDetails({ request, vehicle }) {
  return (
    <div className="space-y-6 py-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
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

          <h3 className="text-xl font-bold text-gray-900 mb-4">
            {vehicle?.year} {vehicle?.make} {vehicle?.model}
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">VIN</p>
              <p className="font-medium">{vehicle?.vin}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">License Plate</p>
              <p className="font-medium">{vehicle?.license_plate}</p>
            </div>
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
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Wrench className="w-4 h-4 text-blue-600" />
                <p className="font-semibold text-blue-900">Assigned Technician</p>
              </div>
              <p className="text-blue-700">{request.assigned_technician_name}</p>
            </div>
          )}

          <div className="border-t pt-6">
            <h4 className="font-semibold text-gray-900 mb-4">Requested Services</h4>
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
          </div>

          {request.work_notes && (
            <div className="border-t pt-6 mt-6">
              <h4 className="font-semibold text-gray-900 mb-2">Work Notes</h4>
              <p className="text-gray-700">{request.work_notes}</p>
            </div>
          )}

          {request.completed_date && (
            <div className="border-t pt-6 mt-6">
              <div className="flex items-center gap-2 text-green-700">
                <Calendar className="w-4 h-4" />
                <p className="font-medium">
                  Completed on {new Date(request.completed_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}