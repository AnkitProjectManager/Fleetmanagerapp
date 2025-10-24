import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Mail, Phone, UserCheck, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function Administrators() {
  const queryClient = useQueryClient();
  const [user, setUser] = React.useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    user_email: "",
    user_name: "",
    phone: "",
    is_primary: false
  });

  React.useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: administrators, isLoading } = useQuery({
    queryKey: ['administrators', user?.fleet_id],
    queryFn: () => base44.entities.Administrator.filter({ fleet_id: user?.fleet_id }, '-created_date'),
    enabled: !!user?.fleet_id,
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (adminData) => base44.entities.Administrator.create({
      ...adminData,
      fleet_id: user.fleet_id
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['administrators'] });
      setShowAddDialog(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Administrator.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['administrators'] });
    },
  });

  const resetForm = () => {
    setFormData({
      user_email: "",
      user_name: "",
      phone: "",
      is_primary: false
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fleet Administrators</h1>
            <p className="text-gray-500 mt-1">Manage account administrators</p>
          </div>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Administrator
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4">
            {Array(3).fill(0).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-24 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : administrators.length === 0 ? (
          <Card className="shadow-md">
            <CardContent className="p-12 text-center">
              <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Administrators</h3>
              <p className="text-gray-500 mb-6">Add administrators to manage your fleet</p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Administrator
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {administrators.map((admin) => (
              <Card key={admin.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {admin.user_name?.[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {admin.user_name}
                          </h3>
                          {admin.is_primary && (
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                              Primary
                            </span>
                          )}
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {admin.user_email}
                          </div>
                          {admin.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              {admin.phone}
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Added {new Date(admin.created_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {!admin.is_primary && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm(`Remove ${admin.user_name} as administrator?`)) {
                            deleteMutation.mutate(admin.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Administrator</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Name *</Label>
                  <Input
                    value={formData.user_name}
                    onChange={(e) => setFormData({...formData, user_name: e.target.value})}
                    required
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={formData.user_email}
                    onChange={(e) => setFormData({...formData, user_email: e.target.value})}
                    required
                    placeholder="john@company.com"
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_primary"
                    checked={formData.is_primary}
                    onCheckedChange={(checked) => setFormData({...formData, is_primary: checked})}
                  />
                  <label
                    htmlFor="is_primary"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Primary Fleet Manager
                  </label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddDialog(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Add Administrator
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}