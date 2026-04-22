import json

from django.test import TestCase

from .models import AssetScanEvent, Consumable, InventoryAssignment, User


class AssetScanActionTests(TestCase):
    def setUp(self):
        self.actor = User.objects.create(
            name="Admin Consumables",
            email="admin.consumables@example.com",
            password_hash="placeholder",
            role=User.ROLE_ADMIN_CONSUMABLES,
            is_active=True,
        )
        self.employee = User.objects.create(
            name="Asset Employee",
            email="asset.employee@example.com",
            password_hash="placeholder",
            role=User.ROLE_EMPLOYEE,
            is_active=True,
            branch="HQ",
        )
        self.consumable = Consumable.objects.create(
            asset_tag="LEC-SCAN-001",
            item_name="Laptop",
            brand="Dell",
            model_number="Latitude",
            serial_number="SN-001",
            category="Hardware",
            subcategory="Laptop",
            quantity=5,
            status="In Stock",
            condition="Good",
            supplier="Supplier",
            purchase_date="2026-01-01",
        )

    def _get_scan_token(self) -> str:
        response = self.client.get("/api/consumables")
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertGreaterEqual(len(payload), 1)
        matching_item = next((item for item in payload if item.get("id") == self.consumable.id), None)
        self.assertIsNotNone(matching_item)
        token = matching_item.get("scan_token") if matching_item else None
        assert isinstance(token, str)
        self.assertTrue(token)
        return token

    def test_scan_detail_returns_asset(self):
        token = self._get_scan_token()
        response = self.client.get(f"/api/consumables/scan/{token}")
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["asset"]["id"], self.consumable.id)
        self.assertIn("recent_scan_events", payload)

    def test_check_out_and_check_in_updates_stock_and_logs_events(self):
        token = self._get_scan_token()

        check_out_response = self.client.post(
            f"/api/consumables/scan/{token}/action",
            data=json.dumps(
                {
                    "action": "check_out",
                    "actor_user_id": self.actor.id,
                    "employee_id": self.employee.id,
                    "quantity": 2,
                }
            ),
            content_type="application/json",
        )
        self.assertEqual(check_out_response.status_code, 200)
        self.consumable.refresh_from_db()
        self.assertEqual(self.consumable.quantity, 3)
        self.assertEqual(self.consumable.assigned_employee, self.employee.name)
        self.assertEqual(
            InventoryAssignment.objects.filter(consumable=self.consumable, employee=self.employee).count(),
            1,
        )

        check_in_response = self.client.post(
            f"/api/consumables/scan/{token}/action",
            data=json.dumps(
                {
                    "action": "check_in",
                    "actor_user_id": self.actor.id,
                    "employee_id": self.employee.id,
                    "quantity": 1,
                }
            ),
            content_type="application/json",
        )
        self.assertEqual(check_in_response.status_code, 200)

        self.consumable.refresh_from_db()
        self.assertEqual(self.consumable.quantity, 4)
        remaining_assigned = (
            InventoryAssignment.objects.filter(consumable=self.consumable, employee=self.employee)
            .values_list("quantity_assigned", flat=True)
            .first()
        )
        self.assertEqual(remaining_assigned, 1)
        self.assertEqual(
            AssetScanEvent.objects.filter(consumable=self.consumable).count(),
            2,
        )
