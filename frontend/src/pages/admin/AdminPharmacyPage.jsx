import { useEffect, useState } from 'react';
import { pharmacyApi } from '@/api/services';
import { usePageTitle } from '@/context/PageTitleContext';
import { Card, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import DataTable from '@/components/common/DataTable';

export default function AdminPharmacyPage() {
  usePageTitle('Pharmacy Inventory');
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    pharmacyApi.getMedicines().then((res) => {
      setMedicines(res.data.data);
      setLoading(false);
    });
  }, []);

  return (
    <Card>
      <CardContent className="pt-4">
        <DataTable
          loading={loading}
          data={medicines}
          emptyTitle="No medicines in inventory"
          columns={[
            { key: 'name', label: 'Medicine' },
            { key: 'category', label: 'Category', render: (m) => m.category || '—' },
            { key: 'stockQuantity', label: 'Stock', render: (m) => (
              <span className={m.stockQuantity <= m.reorderLevel ? 'text-critical font-medium' : ''}>{m.stockQuantity}</span>
            ) },
            { key: 'unitPrice', label: 'Unit Price', render: (m) => `৳${m.unitPrice}` },
            { key: 'status', label: 'Status', render: (m) => (
              <Badge variant={m.stockQuantity <= m.reorderLevel ? 'critical' : 'stable'}>
                {m.stockQuantity <= m.reorderLevel ? 'Low Stock' : 'In Stock'}
              </Badge>
            ) },
          ]}
        />
      </CardContent>
    </Card>
  );
}
