import logging
import json
from django.utils.deprecation import MiddlewareMixin
from rest_framework_simplejwt.authentication import JWTAuthentication

audit_logger = logging.getLogger('audit')

class AuditLoggingMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if request.method not in ('POST', 'PUT', 'PATCH', 'DELETE'):
            return None

        user = None
        
        # 1. Manually check for the JWT token in the headers
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if auth_header.startswith('Bearer '):
            try:
                jwt_auth = JWTAuthentication()
                # Extract the token string
                token = auth_header.split(' ')[1] 
                validated_token = jwt_auth.get_validated_token(token)
                # Authenticate the user
                user = jwt_auth.get_user(validated_token)
            except Exception:
                pass # If token is expired or invalid, leave user as None

        # 2. Fallback to standard Django session auth (just in case)
        if not user and hasattr(request, 'user') and request.user.is_authenticated:
            user = request.user

        ip = self._get_client_ip(request)

        audit_data = {
            'user_id': str(user.public_id) if user and hasattr(user, 'public_id') else (user.id if user else None),
            'username': user.username if user else 'anonymous',
            'method': request.method,
            'path': request.path,
            'ip': ip,
        }

        audit_logger.info(json.dumps(audit_data))
        return None

    def _get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR', 'unknown')