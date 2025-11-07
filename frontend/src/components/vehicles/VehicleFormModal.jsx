import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';

const VehicleFormModal = ({ isOpen, onClose, onSubmit, vehicle, isLoading }) => {
  const [formData, setFormData] = useState({
    vin: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    licensePlate: '',
    batteryCapacity: '',
    currentBatteryLevel: 100,
    mileage: 0,
    status: 'active',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (vehicle) {
      // Extract nested fields for editing
      const batteryCapacity = vehicle.batteryInfo?.capacity || vehicle.batteryCapacity || '';
      const currentBatteryLevel = vehicle.batteryInfo?.currentLevel || vehicle.currentBatteryLevel || 100;
      const mileage = vehicle.usage?.totalMiles || vehicle.maintenance?.mileage || vehicle.mileage || 0;
      
      setFormData({
        vin: vehicle.vin || '',
        make: vehicle.make || '',
        model: vehicle.model || '',
        year: vehicle.year || new Date().getFullYear(),
        licensePlate: vehicle.licensePlate || '',
        batteryCapacity: batteryCapacity,
        currentBatteryLevel: currentBatteryLevel,
        mileage: mileage,
        status: vehicle.status || 'active',
      });
    } else {
      setFormData({
        vin: '',
        make: '',
        model: '',
        year: new Date().getFullYear(),
        licensePlate: '',
        batteryCapacity: '',
        currentBatteryLevel: 100,
        mileage: 0,
        status: 'active',
      });
    }
    setErrors({});
  }, [vehicle, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.vin || formData.vin.length !== 17) {
      newErrors.vin = 'VIN must be exactly 17 characters';
    }
    if (!formData.make || formData.make.trim().length === 0) {
      newErrors.make = 'Make is required';
    }
    if (!formData.model || formData.model.trim().length === 0) {
      newErrors.model = 'Model is required';
    }
    if (!formData.year || formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = `Year must be between 1900 and ${new Date().getFullYear() + 1}`;
    }
    if (!formData.licensePlate || formData.licensePlate.trim().length === 0) {
      newErrors.licensePlate = 'License plate is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* VIN */}
            <div className="md:col-span-2">
              <label htmlFor="vin" className="block text-sm font-medium text-gray-700 mb-2">
                VIN <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="vin"
                name="vin"
                value={formData.vin}
                onChange={handleChange}
                maxLength={17}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.vin ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter 17-character VIN"
                disabled={isLoading}
              />
              {errors.vin && <p className="mt-1 text-sm text-red-600">{errors.vin}</p>}
            </div>

            {/* Make */}
            <div>
              <label htmlFor="make" className="block text-sm font-medium text-gray-700 mb-2">
                Make <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="make"
                name="make"
                value={formData.make}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.make ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Tesla"
                disabled={isLoading}
              />
              {errors.make && <p className="mt-1 text-sm text-red-600">{errors.make}</p>}
            </div>

            {/* Model */}
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
                Model <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="model"
                name="model"
                value={formData.model}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.model ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Model Y"
                disabled={isLoading}
              />
              {errors.model && <p className="mt-1 text-sm text-red-600">{errors.model}</p>}
            </div>

            {/* Year */}
            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                Year <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                min={1900}
                max={new Date().getFullYear() + 1}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.year ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
              {errors.year && <p className="mt-1 text-sm text-red-600">{errors.year}</p>}
            </div>

            {/* License Plate */}
            <div>
              <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700 mb-2">
                License Plate <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="licensePlate"
                name="licensePlate"
                value={formData.licensePlate}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.licensePlate ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., ABC-123"
                disabled={isLoading}
              />
              {errors.licensePlate && <p className="mt-1 text-sm text-red-600">{errors.licensePlate}</p>}
            </div>

            {/* Battery Capacity */}
            <div>
              <label htmlFor="batteryCapacity" className="block text-sm font-medium text-gray-700 mb-2">
                Battery Capacity (kWh)
              </label>
              <input
                type="number"
                id="batteryCapacity"
                name="batteryCapacity"
                value={formData.batteryCapacity}
                onChange={handleChange}
                min={0}
                step={0.1}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., 75"
                disabled={isLoading}
              />
            </div>

            {/* Current Battery Level */}
            <div>
              <label htmlFor="currentBatteryLevel" className="block text-sm font-medium text-gray-700 mb-2">
                Current Battery Level (%)
              </label>
              <input
                type="number"
                id="currentBatteryLevel"
                name="currentBatteryLevel"
                value={formData.currentBatteryLevel}
                onChange={handleChange}
                min={0}
                max={100}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>

            {/* Mileage */}
            <div>
              <label htmlFor="mileage" className="block text-sm font-medium text-gray-700 mb-2">
                Mileage (miles)
              </label>
              <input
                type="number"
                id="mileage"
                name="mileage"
                value={formData.mileage}
                onChange={handleChange}
                min={0}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., 12500"
                disabled={isLoading}
              />
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={isLoading}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="in_service">In Service</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-colors flex items-center space-x-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{vehicle ? 'Update Vehicle' : 'Add Vehicle'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleFormModal;
