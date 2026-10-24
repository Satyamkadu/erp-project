from rest_framework import viewsets


class AuditModelViewSet(viewsets.ModelViewSet):
    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(created_by=user if user.is_authenticated else None)
