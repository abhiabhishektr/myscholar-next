import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";

export const metadata: Metadata = {
  title: "Payments | Admin Dashboard",
  description: "Manage payments in the admin dashboard",
};

export default function PaymentsPage() {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Payments</h1>
        <Button>
          <CreditCard className="w-4 h-4 mr-2" />
          Add Payment
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Payment management system coming soon. This page will allow you to:
          </p>
          <ul className="list-disc list-inside mt-4 space-y-2 text-muted-foreground">
            <li>View all payment transactions</li>
            <li>Process refunds</li>
            <li>Generate payment reports</li>
            <li>Manage payment methods</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}