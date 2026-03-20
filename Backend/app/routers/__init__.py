from .auth       import router as auth_router
from .vendors    import router as vendors_router
from .agents     import router as agents_router
from .controls   import router as controls_router
from .risks      import router as risks_router
from .dashboard  import router as dashboard_router
from .audit_logs import router as audit_logs_router
from .documents  import router as documents_router
from .roles      import router as roles_router
from .templates  import router as templates_router
from .library    import router as library_router
from .settings   import router as settings_router
from .portal     import router as portal_router

__all__ = [
    "auth_router", "vendors_router", "agents_router", "controls_router",
    "risks_router", "dashboard_router", "audit_logs_router", "documents_router",
    "roles_router", "templates_router", "library_router", "settings_router",
    "portal_router",
]