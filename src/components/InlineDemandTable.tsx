import * as React from "react";
import {
    Table,
    TableHeader,
    TableRow,
    TableHeaderCell,
    TableBody,
    TableCell,
    Button,
    Input,
    Dropdown,
    Option,
    useId,
    Label,
    Text,
    Badge,
} from "@fluentui/react-components";
import { DeleteRegular, AddRegular } from "@fluentui/react-icons";

interface Product {
    id: string;
    label: string;
    qtyPhysical: number;
}

interface LineItem {
    id: string;
    productId: string;
    qty: number;
}

interface InlineDemandTableProps {
    products: Product[];
    onLinesChange: (lines: LineItem[]) => void;
}

export const InlineDemandTable = ({ products, onLinesChange }: InlineDemandTableProps) => {
    const [rows, setRows] = React.useState<LineItem[]>([
        { id: crypto.randomUUID(), productId: "", qty: 1 },
    ]);

    const dropdownId = useId("combo-multi");

    // Propagate changes
    React.useEffect(() => {
        onLinesChange(rows.filter(r => r.productId && r.qty > 0));
    }, [rows, onLinesChange]);

    const handleAddRow = () => {
        setRows([...rows, { id: crypto.randomUUID(), productId: "", qty: 1 }]);
    };

    const handleRemoveRow = (id: string) => {
        setRows(rows.filter((r) => r.id !== id));
    };

    const updateRow = (id: string, field: keyof LineItem, value: any) => {
        setRows(rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    };

    const getProduct = (id: string) => products.find((p) => p.id === id);

    // Excel Paste Logic
    const handlePaste = (e: React.ClipboardEvent) => {
        // Basic implementation: assumes tab specific or csv format: ProductLabel (or ID) \t Qty
        // For simplicity in this demo, we might parse text.
        // Getting complex fast, sticking to simple row manipulation for now unless requested detail.
        // "features: Excel Copy-Paste support." -> implied we should try.
        // Let's implement full row paste if user pastes text with newlines.
        e.preventDefault();
        const text = e.clipboardData.getData("text/plain");
        const lines = text.split(/\r\n|\n/).filter(x => x.trim());

        const newRows: LineItem[] = [];

        lines.forEach(line => {
            const parts = line.split("\t");
            if (parts.length >= 2) {
                // Try to match product by label or ID
                const pIdentifier = parts[0].trim();
                const qty = parseInt(parts[1].trim());

                const product = products.find(p => p.label.toLowerCase() === pIdentifier.toLowerCase() || p.id === pIdentifier);
                if (product && !isNaN(qty)) {
                    newRows.push({ id: crypto.randomUUID(), productId: product.id, qty });
                }
            }
        });

        if (newRows.length > 0) {
            setRows([...rows, ...newRows]);
        }
    };

    return (
        <div onPaste={handlePaste}>
            <Table aria-label="Editable Demand Table">
                <TableHeader>
                    <TableRow>
                        <TableHeaderCell>Article</TableHeaderCell>
                        <TableHeaderCell>Quantité</TableHeaderCell>
                        <TableHeaderCell>Disponibilité</TableHeaderCell>
                        <TableHeaderCell>Actions</TableHeaderCell>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((row) => {
                        const product = getProduct(row.productId);
                        const isStockLow = product ? row.qty > product.qtyPhysical : false;

                        return (
                            <TableRow key={row.id}>
                                <TableCell>
                                    <Dropdown
                                        aria-labelledby={dropdownId}
                                        placeholder="Sélectionner un article"
                                        value={product?.label || ""}
                                        selectedOptions={row.productId ? [row.productId] : []}
                                        onOptionSelect={(e, data) => updateRow(row.id, "productId", data.optionValue)}
                                    >
                                        {products.map((p) => (
                                            <Option key={p.id} value={p.id} text={p.label}>
                                                {p.label}
                                            </Option>
                                        ))}
                                    </Dropdown>
                                </TableCell>
                                <TableCell>
                                    <Input
                                        type="number"
                                        value={row.qty.toString()}
                                        onChange={(e, data) => updateRow(row.id, "qty", parseInt(data.value) || 0)}
                                        min={1}
                                    />
                                </TableCell>
                                <TableCell>
                                    {product && (
                                        isStockLow ?
                                            <Badge color="danger" appearance="tint">Stock insuffisant ({product.qtyPhysical})</Badge> :
                                            <Text size={200} block className="success-text">En stock ({product.qtyPhysical})</Text>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Button
                                        icon={<DeleteRegular />}
                                        aria-label="Supprimer"
                                        onClick={() => handleRemoveRow(row.id)}
                                    />
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
            <div style={{ marginTop: "1rem" }}>
                <Button icon={<AddRegular />} onClick={handleAddRow}>
                    Ajouter une ligne
                </Button>
            </div>
        </div>
    );
};
