
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Trash2, DollarSign, Settings, AlertCircle, Save } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

export default function FleetControls() {
  const queryClient = useQueryClient();
  const [user, setUser] = React.useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  React.useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: controls, isLoading } = useQuery({
    queryKey: ['fleetControls', user?.fleet_id],
    queryFn: async () => {
      const result = await base44.entities.FleetControls.filter({ fleet_id: user?.fleet_id });
      return result.length > 0 ? result[0] : null;
    },
    enabled: !!user?.fleet_id,
  });

  const [formData, setFormData] = useState({
    max_preauth_amount: 500,
    require_approval_above: 1000,
    part_pricing: [],
    auto_approve_within_variance: true
  });

  React.useEffect(() => {
    if (controls) {
      setFormData({
        max_preauth_amount: controls.max_preauth_amount || 500,
        require_approval_above: controls.require_approval_above || 1000,
        part_pricing: controls.part_pricing || [],
        auto_approve_within_variance: controls.auto_approve_within_variance !== false
      });
    }
  }, [controls]);

  const createOrUpdateMutation = useMutation({
    mutationFn: async (data) => {
      if (controls) {
        return await base44.entities.FleetControls.update(controls.id, data);
      } else {
        return await base44.entities.FleetControls.create({
          ...data,
          fleet_id: user.fleet_id
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fleetControls'] });
      setHasChanges(false);
    },
  });

  const handleSave = () => {
    createOrUpdateMutation.mutate(formData);
  };

  const addPartPricing = () => {
    setFormData({
      ...formData,
      part_pricing: [
        ...formData.part_pricing,
        {
          part_name: "",
          category: "tires",
          expected_price: 0,
          variance_percentage: 10
        }
      ]
    });
    setHasChanges(true);
  };

  const updatePartPricing = (index, field, value) => {
    const updated = [...formData.part_pricing];
    updated[index] = {
      ...updated[index],
      [field]: field === 'expected_price' || field === 'variance_percentage' ? parseFloat(value) || 0 : value
    };
    setFormData({
      ...formData,
      part_pricing: updated
    });
    setHasChanges(true);
  };

  const removePartPricing = (index) => {
    const updated = formData.part_pricing.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      part_pricing: updated
    });
    setHasChanges(true);
  };

  const updateControl = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
    setHasChanges(true);
  };

  const tireCategories = [
    { label: "18 inch Tires", value: "18_inch_tires" },
    { label: "19 inch Tires", value: "19_inch_tires" },
    { label: "20 inch Tires", value: "20_inch_tires" },
    { label: "Oil Filter", value: "oil_filter" },
    { label: "Air Filter", value: "air_filter" },
    { label: "Brake Pads", value: "brake_pads" },
    { label: "Brake Rotors", value: "brake_rotors" },
    { label: "Battery", value: "battery" },
    { label: "Wiper Blades", value: "wiper_blades" },
    { label: "Custom Part", value: "custom" }
  ];

  if (!user?.fleet_id) {
    return (
      <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please set up your fleet account first before configuring controls.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fleet Controls</h1>
            <p className="text-gray-500 mt-1">Manage spending limits and part pricing authorization</p>
          </div>
          {hasChanges && (
            <Button
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700"
              disabled={createOrUpdateMutation.isLoading}
            >
              <Save className="w-4 h-4 mr-2" />
              {createOrUpdateMutation.isLoading ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </div>

        <div className="space-y-6">
          {/* Spending Authorization Limits */}
          <Card className="shadow-md">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Spending Authorization Limits</CardTitle>
                  <CardDescription>Set automatic approval thresholds for service costs</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="maxPreauth">Maximum Pre-Authorization Amount</Label>
                  <div className="relative mt-2">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      id="maxPreauth"
                      type="number"
                      value={formData.max_preauth_amount}
                      onChange={(e) => updateControl('max_preauth_amount', parseFloat(e.target.value) || 0)}
                      className="pl-7"
                      placeholder="500"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Services under this amount are automatically approved
                  </p>
                </div>

                <div>
                  <Label htmlFor="requireApproval">Require Approval Above</Label>
                  <div className="relative mt-2">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      id="requireApproval"
                      type="number"
                      value={formData.require_approval_above}
                      onChange={(e) => updateControl('require_approval_above', parseFloat(e.target.value) || 0)}
                      className="pl-7"
                      placeholder="1000"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Services above this amount require explicit approval
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-Approve Within Variance</Label>
                  <p className="text-sm text-gray-500">
                    Automatically approve parts if they're within the allowed price variance
                  </p>
                </div>
                <Switch
                  checked={formData.auto_approve_within_variance}
                  onCheckedChange={(checked) => updateControl('auto_approve_within_variance', checked)}
                />
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-900">
                  <strong>How it works:</strong> When a mechanic submits a service request, if the total cost is under ${formData.max_preauth_amount}, it will be automatically approved. Between ${formData.max_preauth_amount} and ${formData.require_approval_above}, it requires review. Above ${formData.require_approval_above}, explicit approval is mandatory.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Part Pricing & Variance */}
          <Card className="shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Settings className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle>Part Pricing & Variance Controls</CardTitle>
                    <CardDescription>Set expected prices and allowed variance for specific parts</CardDescription>
                  </div>
                </div>
                <Button
                  onClick={addPartPricing}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Part
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {formData.part_pricing.length === 0 ? (
                <div className="text-center py-12">
                  <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Part Pricing Configured</h3>
                  <p className="text-gray-500 mb-4">
                    Add parts with expected prices and variance controls
                  </p>
                  <Button onClick={addPartPricing} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Part
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.part_pricing.map((part, index) => (
                    <Card key={index} className="border-2">
                      <CardContent className="p-4">
                        <div className="grid md:grid-cols-4 gap-4">
                          <div>
                            <Label className="text-xs">Part Category</Label>
                            <Select
                              value={part.category || "custom"}
                              onValueChange={(value) => {
                                updatePartPricing(index, 'category', value);
                                if (value !== 'custom') {
                                  const selected = tireCategories.find(c => c.value === value);
                                  updatePartPricing(index, 'part_name', selected?.label || '');
                                }
                              }}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {tireCategories.map((cat) => (
                                  <SelectItem key={cat.value} value={cat.value}>
                                    {cat.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {part.category === 'custom' && (
                            <div>
                              <Label className="text-xs">Part Name</Label>
                              <Input
                                value={part.part_name}
                                onChange={(e) => updatePartPricing(index, 'part_name', e.target.value)}
                                placeholder="Custom part name"
                                className="mt-1"
                              />
                            </div>
                          )}

                          <div className={part.category === 'custom' ? '' : 'md:col-span-2'}>
                            <Label className="text-xs">Expected Price</Label>
                            <div className="relative mt-1">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                              <Input
                                type="number"
                                step="0.01"
                                value={part.expected_price}
                                onChange={(e) => updatePartPricing(index, 'expected_price', e.target.value)}
                                className="pl-7"
                                placeholder="0.00"
                              />
                            </div>
                          </div>

                          <div>
                            <Label className="text-xs">Allowed Variance</Label>
                            <div className="relative mt-1">
                              <Input
                                type="number"
                                step="1"
                                value={part.variance_percentage}
                                onChange={(e) => updatePartPricing(index, 'variance_percentage', e.target.value)}
                                className="pr-8"
                                placeholder="10"
                              />
                              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-4 border-t">
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Max Authorized Price: </span>
                            <span className="text-green-600 font-semibold">
                              ${(part.expected_price * (1 + part.variance_percentage / 100)).toFixed(2)}
                            </span>
                            <span className="text-gray-500 ml-2">
                              (${part.expected_price} + {part.variance_percentage}%)
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removePartPricing(index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {formData.part_pricing.length > 0 && (
                <Alert className="mt-6 bg-purple-50 border-purple-200">
                  <AlertCircle className="h-4 w-4 text-purple-600" />
                  <AlertDescription className="text-purple-900">
                    <strong>Example:</strong> If you set an 18" tire at $150 with 10% variance, any quote up to $165 will be automatically authorized. Quotes above $165 will require your approval.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Summary Card */}
          {formData.part_pricing.length > 0 && (
            <Card className="shadow-md bg-gradient-to-br from-gray-50 to-gray-100">
              <CardHeader>
                <CardTitle className="text-lg">Authorization Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Configured Parts</h4>
                    <div className="space-y-2">
                      {formData.part_pricing.map((part, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600">{part.part_name || 'Unnamed Part'}</span>
                          <span className="font-medium text-gray-900">
                            ${part.expected_price} (±{part.variance_percentage}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Quick Reference</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Auto-Approve Under:</span>
                        <span className="font-medium text-green-600">${formData.max_preauth_amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Review Required:</span>
                        <span className="font-medium text-yellow-600">
                          ${formData.max_preauth_amount} - ${formData.require_approval_above}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Approval Mandatory Above:</span>
                        <span className="font-medium text-red-600">${formData.require_approval_above}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
