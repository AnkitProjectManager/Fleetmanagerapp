import React, { useState, useEffect } from 'react';
import { vehicleAPI } from '../services/api';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Plus, Edit, Trash2, Car } from 'lucide-react';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    licensePlate: '',
    vin: '',
    mileage: '',
    fuelType: 'gasoline',
    status: 'active',
  });

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const response = await vehicleAPI.getAll();
      setVehicles(response.data);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVehicle) {
        await vehicleAPI.update(editingVehicle.id, formData);
      } else {
        await vehicleAPI.create(formData);
      }
      await loadVehicles();
      resetForm();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      alert('Error saving vehicle: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year.toString(),
      licensePlate: vehicle.licensePlate,
      vin: vehicle.vin,
      mileage: vehicle.mileage.toString(),
      fuelType: vehicle.fuelType,
      status: vehicle.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await vehicleAPI.delete(id);
        await loadVehicles();
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        alert('Error deleting vehicle: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      make: '',
      model: '',
      year: '',
      licensePlate: '',
      vin: '',
      mileage: '',
      fuelType: 'gasoline',
      status: 'active',
    });
    setEditingVehicle(null);
    setShowForm(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading vehicles...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vehicles</h1>
          <p className="mt-2 text-gray-600">Manage your fleet vehicles</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Vehicle
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="make">Make</Label>
                  <Input
                    id="make"
                    name="make"
                    value={formData.make}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    name="year"
                    type="number"
                    value={formData.year}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="licensePlate">License Plate</Label>
                  <Input
                    id="licensePlate"
                    name="licensePlate"
                    value={formData.licensePlate}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="vin">VIN</Label>
                  <Input
                    id="vin"
                    name="vin"
                    value={formData.vin}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="mileage">Mileage</Label>
                  <Input
                    id="mileage"
                    name="mileage"
                    type="number"
                    value={formData.mileage}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="fuelType">Fuel Type</Label>
                  <select
                    id="fuelType"
                    name="fuelType"
                    value={formData.fuelType}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  >
                    <option value="gasoline">Gasoline</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Electric</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button type="submit">
                  {editingVehicle ? 'Update Vehicle' : 'Create Vehicle'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Vehicles List */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {vehicles.map((vehicle) => (
          <Card key={vehicle.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {vehicle.make} {vehicle.model}
                </CardTitle>
                <Car className="h-6 w-6 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Year:</span>
                  <span>{vehicle.year}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">License Plate:</span>
                  <span className="font-mono">{vehicle.licensePlate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mileage:</span>
                  <span>{vehicle.mileage?.toLocaleString()} miles</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`capitalize px-2 py-1 rounded-full text-xs ${
                    vehicle.status === 'active' ? 'bg-green-100 text-green-800' :
                    vehicle.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {vehicle.status}
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(vehicle)}
                  className="flex-1"
                >
                  <Edit className="mr-1 h-3 w-3" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(vehicle.id)}
                  className="flex-1"
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {vehicles.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Car className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No vehicles found</h3>
            <p className="mt-2 text-gray-600">Get started by adding your first vehicle.</p>
            <Button onClick={() => setShowForm(true)} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Add Vehicle
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Vehicles;