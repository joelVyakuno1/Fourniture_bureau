import * as React from "react";
import {
    Card,
    CardHeader,
    Text,
    Button,
    Table,
    TableHeader,
    TableRow,
    TableHeaderCell,
    TableBody,
    TableCell,
    Avatar,
    Badge,
} from "@fluentui/react-components";
import { StatusBadge } from "./StatusBadge";

interface Request {
    id: string;
    userId: string;
    created: string;
    status: string;
    lines: { productId: string; qty: number }[];
}

interface StockDashboardProps {
    requests: Request[];
    onDeliver: (requestId: string) => void;
}

export const StockDashboard = ({ requests, onDeliver }: StockDashboardProps) => {
    const pendingRequests = requests.filter((r) => r.status === "Approved");

    return (
        <div style={{ padding: "1rem", display: "grid", gap: "1rem" }}>
            <Text as="h2" size={600}>Gestion de Stock (Secretariat)</Text>

            {pendingRequests.length === 0 ? (
                <Text>Aucune demande approuvée en attente de livraison.</Text>
            ) : (
                pendingRequests.map((req) => (
                    <Card key={req.id}>
                        <CardHeader
                            image={<Avatar name={req.userId} />}
                            header={
                                <Text weight="semibold">
                                    Demande de {req.userId}
                                </Text>
                            }
                            description={<Text size={200}>{new Date(req.created).toLocaleDateString()}</Text>}
                            action={
                                <Button appearance="primary" onClick={() => onDeliver(req.id)}>
                                    Livrer
                                </Button>
                            }
                        />
                        <div style={{ padding: "0 1rem 1rem" }}>
                            <StatusBadge status={req.status} />
                            <Table size="small">
                                <TableHeader>
                                    <TableRow>
                                        <TableHeaderCell>Article</TableHeaderCell>
                                        <TableHeaderCell>Qté</TableHeaderCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {req.lines.map((line, i) => (
                                        <TableRow key={i}>
                                            <TableCell>{line.productId}</TableCell> {/* ideally map to label */}
                                            <TableCell>{line.qty}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                ))
            )}
        </div>
    );
};
