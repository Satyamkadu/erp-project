import os
import sys
import ast
import django
from pathlib import Path

# Initialize Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from django.apps import apps
from django.db import models

TARGET_APPS = ["users", "organization", "projects", "assets", "leave", "expense"]

errors = []
warnings = []

print("=" * 65)
print("🚀 RUNNING ERP ARCHITECTURAL & INTEGRATION AUDIT")
print("=" * 65)

# 1. CHECK MODELS: public_id, is_deleted, created_by
print("\n🔍 [1/4] Auditing Database Models (Audit Fields & UUIDs)...")
for app_label in TARGET_APPS:
    try:
        app_config = apps.get_app_config(app_label)
    except LookupError:
        warnings.append(f"App '{app_label}' is not in INSTALLED_APPS.")
        continue

    for model in app_config.get_models():
        model_name = f"{app_label}.{model.__name__}"
        field_names = [f.name for f in model._meta.get_fields()]

        if model.__name__ == "User":
            continue

        if "public_id" not in field_names:
            errors.append(f"[MODEL] {model_name} is missing 'public_id' (UUID).")
        if "is_deleted" not in field_names:
            errors.append(f"[MODEL] {model_name} is missing 'is_deleted' (Soft Delete).")
        if "created_by" not in field_names:
            warnings.append(f"[MODEL] {model_name} is missing 'created_by' field.")

# 2. AST SCANNER FOR VIEWS: N+1 Queries, Atomic Transactions, lookup_field
print("🔍 [2/4] Auditing Views (N+1 Queries, Atomic Transactions, lookup_field)...")
base_dir = Path(__file__).resolve().parent

for app_label in TARGET_APPS:
    views_path = base_dir / app_label / "views.py"
    if not views_path.exists():
        continue

    source = views_path.read_text(encoding="utf-8")
    tree = ast.parse(source, filename=str(views_path))

    has_atomic_import = "atomic" in source

    for node in ast.walk(tree):
        if isinstance(node, ast.ClassDef):
            class_code = ast.get_source_segment(source, node) or ""
            is_viewset = any(
                "ViewSet" in getattr(b, "id", getattr(b, "attr", ""))
                for b in node.bases
            )

            if is_viewset:
                # Check lookup_field = 'public_id'
                if "lookup_field" not in class_code and "AuditViewSet" not in class_code:
                    warnings.append(
                        f"[ROUTING] {app_label}.views.{node.name}: Missing `lookup_field = 'public_id'`."
                    )

                # Check N+1 prevention (select_related / prefetch_related)
                if "select_related" not in class_code and "prefetch_related" not in class_code:
                    errors.append(
                        f"[N+1 RISK] {app_label}.views.{node.name}: No `select_related` or `prefetch_related` found in queryset."
                    )

            # Inspect methods inside Views/ViewSets for state changes without @transaction.atomic
            for item in node.body:
                if isinstance(item, ast.FunctionDef):
                    method_code = ast.get_source_segment(source, item) or ""
                    writes_count = method_code.count(".save(") + method_code.count(".create(") + method_code.count(".update(")
                    
                    # If a method performs multiple DB writes or is a custom workflow action (approve/reject/allocate)
                    is_workflow_action = any(k in item.name for k in ["approve", "reject", "allocate", "return", "cancel", "perform_create"])
                    if (writes_count > 1 or is_workflow_action) and "atomic" not in method_code:
                        warnings.append(
                            f"[ATOMICITY] {app_label}.views.{node.name}.{item.name}(): Modifies state without `transaction.atomic`."
                        )

# 3. SERIALIZER AUDIT: Ensure raw PK 'id' isn't exposed & FKs use public_id
print("🔍 [3/4] Auditing Serializers (UUID Lookups & ReadOnly Names)...")
for app_label in TARGET_APPS:
    ser_path = base_dir / app_label / "serializers.py"
    if not ser_path.exists():
        continue

    source = ser_path.read_text(encoding="utf-8")
    if "'__all__'" in source or '"__all__"' in source:
        errors.append(
            f"[SECURITY/INTEGRATION] {app_label}/serializers.py uses `fields = '__all__'`, which leaks internal `id` and `is_deleted` to the frontend!"
        )

# 4. REPORT RESULTS
print("\n" + "=" * 65)
if warnings:
    print(f"⚠️  WARNINGS ({len(warnings)}):")
    for w in warnings:
        print(f"  - {w}")

if errors:
    print(f"\n❌ FAILED CHECKS ({len(errors)}):")
    for e in errors:
        print(f"  - {e}")
    print("=" * 65)
    sys.exit(1)
else:
    print("\n✅ ALL MANDATORY ARCHITECTURAL CHECKS PASSED!")
    print("=" * 65)
    sys.exit(0)