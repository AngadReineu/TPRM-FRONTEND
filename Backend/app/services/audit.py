from sqlalchemy.orm import Session
from ..models.audit_log import AuditLog
from ..models.user import User


class AuditService:
    @staticmethod
    def log(
        db: Session,
        user: User,
        action: str,
        entity: str = "",
        desc: str = "",
        ip: str = "unknown",
        status: str = "Success",
    ) -> None:
        """Write one audit log row. Call this from every router that mutates data."""
        entry = AuditLog(
            user=user.name,
            role=user.role,
            action=action,
            entity=entity,
            desc=desc,
            ip=ip,
            status=status,
        )
        db.add(entry)
        db.commit()
