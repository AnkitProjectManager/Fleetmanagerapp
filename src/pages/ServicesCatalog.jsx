import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, Wrench } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ServicesCatalog() {
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    service_name: "",
    description: "",
    default_price: 0,
    category: "maintenance",
    estimated_duration: 1
  });

  const { data: services, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.list(),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (serviceData) => base44.entities.Service.create(serviceData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setShowAddDialog(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Service.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setShowAddDialog(false);
      setEditingService(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Service.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });

  const resetForm = () => {
    setFormData({
      service_name: "",
      description: "",
      default_price: 0,
      category: "maintenance",
      estimated_duration: 1
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingService) {
      updateMutation.mutate({ id: editingService.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      service_name: service.service_name,
      description: service.description || "",
      default_price: service.default_price,
      category: service.category,
      estimated_duration: service.estimated_duration || 1
    });
    setShowAddDialog(true);
  };

  const servicesByCategory = services.reduce((acc, service) => {
    const category = service.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(service);
    return acc;
  }, {});

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Services Catalog</h1>
            <p className="text-gray-500 mt-1">Manage available services and pricing</p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setEditingService(null);
              setShowAddDialog(true);
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-6">
            {Array(3).fill(0).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-32 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : services.length === 0 ? (
          <Card className="shadow-md">
            <CardContent className="p-12 text-center">
              <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Services</h3>
              <p className="text-gray-500 mb-6">Add services to your catalog</p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Service
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
              <div key={category}>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 capitalize">
                  {category.replace(/_/g, ' ')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryServices.map((service) => (
                    <Card key={service.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Wrench className="w-5 h-5 text-blue-600" />
                            </div>
                            <CardTitle className="text-lg">{service.service_name}</CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {service.description && (
                          <p className="text-sm text-gray-600 mb-4">{service.description}</p>
                        )}
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm text-gray-500">Default Price</span>
                          <span className="text-xl font-bold text-green-600">
                            ${service.default_price}
                          </span>
                        </div>
                        {service.estimated_duration && (
                          <p className="text-xs text-gray-500 mb-4">
                            Est. {service.estimated_duration}h
                          </p>
                        )}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleEdit(service)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (confirm('Delete this service?')) {
                                deleteMutation.mutate(service.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingService ? "Edit Service" : "Add New Service"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Service Name *</Label>
                  <Input
                    value={formData.service_name}
                    onChange={(e) => setFormData({...formData, service_name: e.target.value})}
                    required
                    placeholder="Oil Change"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Full synthetic oil change with filter replacement"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Default Price *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.default_price}
                      onChange={(e) => setFormData({...formData, default_price: parseFloat(e.target.value)})}
                      required
                    />
                  </div>
                  <div>
                    <Label>Estimated Duration (hours)</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={formData.estimated_duration}
                      onChange={(e) => setFormData({...formData, estimated_duration: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>
                <div>
                  <Label>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({...formData, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="repair">Repair</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                      <SelectItem value="tire_service">Tire Service</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddDialog(false);
                    setEditingService(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingService ? "Update" : "Add"} Service
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}