import { Badge } from "@fluentui/react-components";

type Status = "Pending" | "Approved" | "Rejected" | "Delivered";

interface StatusBadgeProps {
    status: string;
}

const statusMap: Record<string, { label: string; appearance: "filled" | "ghost" | "outline" | "tint"; color: "brand" | "danger" | "severe" | "warning" | "success" | "important" }> = {
    Pending: { label: "En attente d'approbation", appearance: "filled", color: "warning" },
    Approved: { label: "Approuvée", appearance: "filled", color: "brand" },
    Rejected: { label: "Refusée", appearance: "filled", color: "danger" },
    Delivered: { label: "Livrée", appearance: "filled", color: "success" },
};

export const StatusBadge = ({ status }: StatusBadgeProps) => {
    const config = statusMap[status] || { label: status, appearance: "outline", color: "important" };
    return (
        <Badge appearance={config.appearance} color={config.color}>
            {config.label}
        </Badge>
    );
};
