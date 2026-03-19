from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0014_merge_20260319_0204"),
    ]

    operations = [
        migrations.AlterField(
            model_name="user",
            name="role",
            field=models.CharField(
                choices=[
                    ("employee", "Employee"),
                    ("technician", "Technician"),
                    ("admin_fault", "Admin Fault"),
                    ("admin_consumables", "Admin Consumables"),
                    ("manager", "Manager"),
                ],
                default="employee",
                max_length=32,
            ),
        ),
    ]
