import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ChevronRight } from "lucide-react";

export default function CreateServiceRequest({ user, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [selectedServices, setSelectedServices] = useState([]);
  const [priority, setPriority] = useState("normal");
  const [additionalNotes, setAdditionalNotes] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: vehicles } = useQuery({
    queryKey: ['vehicles', user?.fleet_id],
    queryFn: () => base44.entities.Vehicle.filter({ fleet_id: user?.fleet_id, status: 'active' }),
    enabled: !!user?.fleet_id,
    initialData: [],
  });

  const { data: services } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.list(),
    initialData: [],
  });

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

  const servicesByCategory = services.reduce((acc, service) => {
    const category = service.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(service);
    return acc;
  }, {});

  const toggleService = (service) => {
    setSelectedServices(prev => {
      const exists = prev.find(s => s.service_id === service.id);
      if (exists) {
        return prev.filter(s => s.service_id !== service.id);
      } else {
        return [...prev, {
          service_id: service.id,
          service_name: service.service_name,
          notes: ""
        }];
      }
    });
  };

  const handleSubmit = async () => {
    if (!selectedVehicleId || selectedServices.length === 0) return;

    setIsSubmitting(true);
    try {
      const requestData = {
        fleet_id: user.fleet_id,
        vehicle_id: selectedVehicleId,
        requested_by: user.email,
        requested_services: selectedServices.map(s => ({
          ...s,
          notes: additionalNotes[s.service_id] || ""
        })),
        status: "waiting",
        priority: priority
      };

      await base44.entities.ServiceRequest.create(requestData);
      onSuccess();
    } catch (error) {
      console.error("Error creating service request:", error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6 py-4">
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <Label className="text-lg font-semibold mb-4 block">Step 1: Select Vehicle</Label>
            {vehicles.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No active vehicles available. Please add vehicles first.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3">
                {vehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    onClick={() => setSelectedVehicleId(vehicle.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedVehicleId === vehicle.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </p>
                        <p className="text-sm text-gray-600">VIN: {vehicle.vin}</p>
                        <p className="text-sm text-gray-600">License: {vehicle.license_plate}</p>
                      </div>
                      {selectedVehicleId === vehicle.id && (
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <ChevronRight className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <Button
              onClick={() => setStep(2)}
              disabled={!selectedVehicleId}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Next: Select Services
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <Label className="text-lg font-semibold">Step 2: Select Services</Label>
            <Button variant="outline" size="sm" onClick={() => setStep(1)}>
              Back
            </Button>
          </div>

          {selectedVehicle && (
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="font-semibold text-blue-900">
                {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
              </p>
              <p className="text-sm text-blue-700">VIN: {selectedVehicle.vin}</p>
            </div>
          )}

          {services.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No services available. Please contact support.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-6">
              {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
                <div key={category}>
                  <h3 className="font-semibold text-gray-900 mb-3 capitalize">
                    {category.replace(/_/g, ' ')}
                  </h3>
                  <div className="space-y-2">
                    {categoryServices.map((service) => {
                      const isSelected = selectedServices.find(s => s.service_id === service.id);
                      return (
                        <div key={service.id} className="space-y-2">
                          <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                            <Checkbox
                              checked={!!isSelected}
                              onCheckedChange={() => toggleService(service)}
                              id={service.id}
                            />
                            <label
                              htmlFor={service.id}
                              className="flex-1 cursor-pointer"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {service.service_name}
                                  </p>
                                  {service.description && (
                                    <p className="text-sm text-gray-600">
                                      {service.description}
                                    </p>
                                  )}
                                </div>
                                <p className="text-sm font-semibold text-gray-900">
                                  ${service.default_price}
                                </p>
                              </div>
                            </label>
                          </div>
                          {isSelected && (
                            <Textarea
                              placeholder="Add specific notes for this service..."
                              value={additionalNotes[service.id] || ""}
                              onChange={(e) => setAdditionalNotes({
                                ...additionalNotes,
                                [service.id]: e.target.value
                              })}
                              className="ml-9"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-4 border-t">
            <Label className="mb-2 block">Priority Level</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={selectedServices.length === 0 || isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? "Creating..." : `Submit Request (${selectedServices.length} services)`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}