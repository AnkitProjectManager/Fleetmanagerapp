import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Upload, Truck, Edit, Trash2, Download, Building2 } from "lucide-react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function Vehicles() {
  const queryClient = useQueryClient();
  const [user, setUser] = React.useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showFleetSetup, setShowFleetSetup] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [fleetFormData, setFleetFormData] = useState({
    company_name: "",
    contact_email: "",
    contact_phone: "",
    address: ""
  });

  React.useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      if (currentUser.user_role === 'fleet_manager' && !currentUser.fleet_id) {
        setShowFleetSetup(true);
        setFleetFormData({
          company_name: "",
          contact_email: currentUser.email,
          contact_phone: currentUser.phone || "",
          address: ""
        });
      }
    };
    loadUser();
  }, []);

  const [formData, setFormData] = useState({
    vin: "",
    license_plate: "",
    year: new Date().getFullYear(),
    make: "",
    model: "",
    status: "active",
    notes: ""
  });

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['vehicles', user?.fleet_id],
    queryFn: () => base44.entities.Vehicle.filter({ fleet_id: user?.fleet_id }, '-created_date'),
    enabled: !!user?.fleet_id,
    initialData: [],
  });

  const createFleetMutation = useMutation({
    mutationFn: async (fleetData) => {
      const fleet = await base44.entities.Fleet.create(fleetData);
      await base44.auth.updateMe({ fleet_id: fleet.id });
      await base44.entities.Administrator.create({
        fleet_id: fleet.id,
        user_email: user.email,
        user_name: user.full_name || user.email,
        phone: user.phone || "",
        is_primary: true
      });
      return fleet;
    },
    onSuccess: async () => {
      const updatedUser = await base44.auth.me();
      setUser(updatedUser);
      setShowFleetSetup(false);
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });

  const createMutation = useMutation({
    mutationFn: (vehicleData) => base44.entities.Vehicle.create({ ...vehicleData, fleet_id: user.fleet_id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      setShowAddDialog(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Vehicle.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      setShowAddDialog(false);
      setEditingVehicle(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Vehicle.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });

  const resetForm = () => {
    setFormData({
      vin: "",
      license_plate: "",
      year: new Date().getFullYear(),
      make: "",
      model: "",
      status: "active",
      notes: ""
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingVehicle) {
      updateMutation.mutate({ id: editingVehicle.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleFleetSetup = (e) => {
    e.preventDefault();
    createFleetMutation.mutate(fleetFormData);
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      vin: vehicle.vin,
      license_plate: vehicle.license_plate,
      year: vehicle.year,
      make: vehicle.make,
      model: vehicle.model,
      status: vehicle.status,
      notes: vehicle.notes || ""
    });
    setShowAddDialog(true);
  };

  const handleBulkUpload = async () => {
    if (!uploadFile) return;
    
    setIsProcessing(true);
    setUploadError(null);
    
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: uploadFile });
      
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            vehicles: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  vin: { type: "string" },
                  license_plate: { type: "string" },
                  year: { type: "integer" },
                  make: { type: "string" },
                  model: { type: "string" },
                  notes: { type: "string" }
                }
              }
            }
          }
        }
      });
      
      if (result.status === "success" && result.output?.vehicles) {
        const vehiclesWithFleetId = result.output.vehicles.map(v => ({
          ...v,
          fleet_id: user.fleet_id,
          status: "active"
        }));
        
        await base44.entities.Vehicle.bulkCreate(vehiclesWithFleetId);
        queryClient.invalidateQueries({ queryKey: ['vehicles'] });
        setShowBulkUpload(false);
        setUploadFile(null);
      } else {
        setUploadError("Could not extract vehicle data from the file. Please check the format.");
      }
    } catch (error) {
      setUploadError("Error processing file. Please try again.");
    }
    
    setIsProcessing(false);
  };

  const downloadTemplate = () => {
    const csvContent = "vin,license_plate,year,make,model,notes\n1HGBH41JXMN109186,ABC123,2023,Honda,Accord,Fleet vehicle\n2HGFA16578H123456,XYZ789,2022,Toyota,Camry,Sales vehicle";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'vehicle_template.csv';
    link.click();
  };

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.vin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.license_plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (showFleetSetup) {
    return (
      <div className="p-4 md:p-8 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen flex items-center justify-center">
        <Card className="max-w-2xl w-full shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Welcome to Fleet Service!</CardTitle>
            <p className="text-gray-500 mt-2">Let's set up your fleet account to get started</p>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleFleetSetup}>
              <div className="space-y-4">
                <div>
                  <Label>Company Name *</Label>
                  <Input
                    value={fleetFormData.company_name}
                    onChange={(e) => setFleetFormData({...fleetFormData, company_name: e.target.value})}
                    required
                    placeholder="Your Company Name"
                  />
                </div>
                <div>
                  <Label>Contact Email *</Label>
                  <Input
                    type="email"
                    value={fleetFormData.contact_email}
                    onChange={(e) => setFleetFormData({...fleetFormData, contact_email: e.target.value})}
                    required
                    placeholder="contact@company.com"
                  />
                </div>
                <div>
                  <Label>Contact Phone</Label>
                  <Input
                    type="tel"
                    value={fleetFormData.contact_phone}
                    onChange={(e) => setFleetFormData({...fleetFormData, contact_phone: e.target.value})}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <Label>Address</Label>
                  <Textarea
                    value={fleetFormData.address}
                    onChange={(e) => setFleetFormData({...fleetFormData, address: e.target.value})}
                    placeholder="123 Main St, City, State ZIP"
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
                disabled={createFleetMutation.isLoading}
              >
                {createFleetMutation.isLoading ? "Setting up..." : "Create Fleet Account"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fleet Vehicles</h1>
            <p className="text-gray-500 mt-1">Manage your vehicle fleet</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowBulkUpload(true)}
            >
              <Upload className="w-4 h-4 mr-2" />
              Bulk Upload
            </Button>
            <Button
              onClick={() => {
                resetForm();
                setEditingVehicle(null);
                setShowAddDialog(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Vehicle
            </Button>
          </div>
        </div>

        <Card className="mb-6 shadow-md">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search by VIN, license plate, make, or model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-32 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredVehicles.length === 0 ? (
          <Card className="shadow-md">
            <CardContent className="p-12 text-center">
              <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Vehicles Found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm ? "Try adjusting your search" : "Add your first vehicle to get started"}
              </p>
              <Button
                onClick={() => {
                  resetForm();
                  setEditingVehicle(null);
                  setShowAddDialog(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Vehicle
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle) => (
              <Card key={vehicle.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Truck className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {vehicle.year} {vehicle.make}
                        </CardTitle>
                        <p className="text-sm text-gray-500">{vehicle.model}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      vehicle.status === 'active' ? 'bg-green-100 text-green-700' :
                      vehicle.status === 'in_service' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {vehicle.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">VIN:</span>
                      <span className="font-medium">{vehicle.vin}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">License:</span>
                      <span className="font-medium">{vehicle.license_plate}</span>
                    </div>
                    {vehicle.notes && (
                      <p className="text-xs text-gray-600 mt-2 pt-2 border-t">
                        {vehicle.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(vehicle)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this vehicle?')) {
                          deleteMutation.mutate(vehicle.id);
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
        )}

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="col-span-2">
                  <Label>VIN *</Label>
                  <Input
                    value={formData.vin}
                    onChange={(e) => setFormData({...formData, vin: e.target.value})}
                    required
                    placeholder="1HGBH41JXMN109186"
                  />
                </div>
                <div className="col-span-2">
                  <Label>License Plate *</Label>
                  <Input
                    value={formData.license_plate}
                    onChange={(e) => setFormData({...formData, license_plate: e.target.value})}
                    required
                    placeholder="ABC123"
                  />
                </div>
                <div>
                  <Label>Year *</Label>
                  <Input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                    required
                    min="1900"
                    max={new Date().getFullYear() + 1}
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({...formData, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="in_service">In Service</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Make *</Label>
                  <Input
                    value={formData.make}
                    onChange={(e) => setFormData({...formData, make: e.target.value})}
                    required
                    placeholder="Toyota"
                  />
                </div>
                <div>
                  <Label>Model *</Label>
                  <Input
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                    required
                    placeholder="Camry"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Additional notes about this vehicle..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddDialog(false);
                    setEditingVehicle(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingVehicle ? "Update" : "Add"} Vehicle
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bulk Upload Vehicles</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Upload a CSV file with your vehicle data. The file should include columns: vin, license_plate, year, make, model, notes.
                </p>
                <Button
                  variant="outline"
                  onClick={downloadTemplate}
                  className="w-full mb-4"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download CSV Template
                </Button>
              </div>
              
              {uploadError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{uploadError}</AlertDescription>
                </Alert>
              )}

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="hidden"
                  id="bulk-upload"
                />
                <label htmlFor="bulk-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {uploadFile ? uploadFile.name : "Click to select CSV file"}
                  </p>
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowBulkUpload(false);
                  setUploadFile(null);
                  setUploadError(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleBulkUpload}
                disabled={!uploadFile || isProcessing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isProcessing ? "Processing..." : "Upload Vehicles"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}