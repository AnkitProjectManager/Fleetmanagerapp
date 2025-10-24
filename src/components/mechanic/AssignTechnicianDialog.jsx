import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AssignTechnicianDialog({ request, open, onClose, onSuccess }) {
  const [selectedTechId, setSelectedTechId] = useState("");

  const { data: technicians } = useQuery({
    queryKey: ['technicians'],
    queryFn: () => base44.entities.Technician.filter({ status: 'available' }),
    initialData: [],
  });

  const assignMutation = useMutation({
    mutationFn: async () => {
      const tech = technicians.find(t => t.id === selectedTechId);
      return base44.entities.ServiceRequest.update(request.id, {
        assigned_technician_id: selectedTechId,
        assigned_technician_name: tech.name,
        status: 'in_progress'
      });
    },
    onSuccess: () => {
      onSuccess();
    },
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Technician</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label>Select Technician</Label>
            <Select value={selectedTechId} onValueChange={setSelectedTechId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a technician" />
              </SelectTrigger>
              <SelectContent>
                {technicians.map((tech) => (
                  <SelectItem key={tech.id} value={tech.id}>
                    {tech.name} - {tech.specialization}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => assignMutation.mutate()}
            disabled={!selectedTechId || assignMutation.isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {assignMutation.isLoading ? "Assigning..." : "Assign & Start Service"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}