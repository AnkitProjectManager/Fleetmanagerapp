import React from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, PlayCircle, CheckCircle, XCircle } from "lucide-react";

const statusConfig = {
  waiting: {
    label: "Waiting",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: Clock
  },
  in_progress: {
    label: "In Progress",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: PlayCircle
  },
  completed: {
    label: "Completed",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: XCircle
  }
};

export default function StatusBadge({ status, showIcon = true }) {
  const config = statusConfig[status] || statusConfig.waiting;
  const Icon = config.icon;

  return (
    <Badge className={`${config.color} border font-medium`}>
      {showIcon && <Icon className="w-3 h-3 mr-1" />}
      {config.label}
    </Badge>
  );
}