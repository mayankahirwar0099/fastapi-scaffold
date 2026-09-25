import { ProjectConfig, GeneratedFile, EntityDefinition } from '../types/generator';
import { parseProjectIdea } from './entityParser';

export function generateFastApiTemplate(config: ProjectConfig): GeneratedFile[] {
  const parsed = parseProjectIdea(config.description || 'A task management API with users and to-dos');
  const entities = parsed.entities;
  const projectSlug = (config.projectName || parsed.inferredProjectTitle)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'fastapi_app';

  const files: GeneratedFile[] = [];

  // 1. main.py
  files.push({
    name: 'main.py',
    path: 'app/main.py',
    language: 'python',
    description: 'FastAPI application entrypoint, middleware, routers, and lifecycle events',
    badge: 'Core Entry',
    content: generateMainPy(config, entities, parsed.inferredProjectTitle),
  });

  // 2. config.py
  files.push({
    name: 'config.py',
    path: 'app/config.py',
    language: 'python',
    description: 'Pydantic V2 BaseSettings loaded from environment variables',
    badge: 'Settings',
    content: generateConfigPy(config),
  });

  // 3. database.py (if DB enabled)
  if (config.includeDatabase) {
    files.push({
      name: 'database.py',
      path: 'app/database.py',
      language: 'python',
      description: 'SQLAlchemy 2.0 engine, SessionLocal factory, and dependency injection',
      badge: 'Database',
      content: generateDatabasePy(config),
    });

    files.push({
      name: 'models.py',
      path: 'app/models.py',
      language: 'python',
      description: 'SQLAlchemy 2.0 ORM models with mapped columns and foreign keys',
      badge: 'Models',
      content: generateModelsPy(config, entities),
    });
  }

  // 4. schemas.py
  files.push({
    name: 'schemas.py',
    path: 'app/schemas.py',
    language: 'python',
    description: 'Pydantic V2 data validation schemas (Base, Create, Response)',
    badge: 'Schemas',
    content: generateSchemasPy(config, entities),
  });

  // 5. auth.py (if Auth enabled)
  if (config.includeAuth) {
    files.push({
      name: 'auth.py',
      path: 'app/auth.py',
      language: 'python',
      description: 'JWT issuance, password hashing (Passlib/Bcrypt), and OAuth2 dependencies',
      badge: 'Security',
      content: generateAuthPy(config),
    });
  }

  // 6. routes
  files.push({
    name: 'routes.py',
    path: 'app/routes.py',
    language: 'python',
    description: 'REST API endpoints with validation, CRUD operations, and pagination',
    badge: 'Routers',
    content: generateRoutesPy(config, entities),
  });

  // 7. requirements.txt
  files.push({
    name: 'requirements.txt',
    path: 'requirements.txt',
    language: 'text',
    description: 'Pinned pip package dependencies tested for compatibility',
    badge: 'Packages',
    content: generateRequirementsTxt(config),
  });

  // 8. Dockerfile & docker-compose.yml (if Docker enabled)
  if (config.includeDocker) {
    files.push({
      name: 'Dockerfile',
      path: 'Dockerfile',
      language: 'dockerfile',
      description: 'Production container build with unprivileged runner user',
      badge: 'DevOps',
      content: generateDockerfile(config),
    });

    files.push({
      name: 'docker-compose.yml',
      path: 'docker-compose.yml',
      language: 'yaml',
      description: 'Container orchestration spec with service health checks',
      badge: 'DevOps',
      content: generateDockerComposeYml(config, projectSlug),
    });

    files.push({
      name: '.dockerignore',
      path: '.dockerignore',
      language: 'text',
      description: 'Exclusion rules for clean and lean Docker build contexts',
      content: `__pycache__\n*.pyc\n*.pyo\n*.pyd\n.Python\nenv/\nvenv/\n.venv/\n.pytest_cache/\n.coverage\nhtmlcov/\n.git/\n.gitignore\n.env\n*.sqlite3\n`,
    });
  }

  // 9. Pytest setup (if Pytest enabled)
  if (config.includePytest) {
    files.push({
      name: 'test_main.py',
      path: 'tests/test_main.py',
      language: 'python',
      description: 'Automated test suite using FastAPI TestClient and pytest fixtures',
      badge: 'Tests',
      content: generateTestMainPy(config, entities),
    });

    files.push({
      name: 'conftest.py',
      path: 'tests/conftest.py',
      language: 'python',
      description: 'Pytest test fixtures, in-memory DB configuration, and test client lifecycle',
      badge: 'Tests',
      content: generateConftestPy(config),
    });
  }

  // 10. .env.example
  files.push({
    name: '.env.example',
    path: '.env.example',
    language: 'bash',
    description: 'Sample environment variables configuration template',
    badge: 'Config',
    content: generateEnvExample(config, projectSlug),
  });

  // 11. README.md
  files.push({
    name: 'README.md',
    path: 'README.md',
    language: 'markdown',
    description: 'Documentation with setup instructions, curl examples, and Swagger docs links',
    badge: 'Docs',
    content: generateReadmeMd(config, parsed.inferredProjectTitle, parsed.summary, entities),
  });

  return files;
}

// -------------------------------------------------------------
// Generators
// -------------------------------------------------------------

function generateMainPy(config: ProjectConfig, entities: EntityDefinition[], title: string): string {
  const hasDb = config.includeDatabase;
  const hasAuth = config.includeAuth;
  const hasCors = config.includeCors;

  return `"""
${title} - FastAPI Backend Application
Generated with FastAPI Scaffolder
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator
from fastapi import FastAPI
${hasCors ? 'from fastapi.middleware.cors import CORSMiddleware\n' : ''}from app.config import settings
from app.routes import api_router
${hasDb ? 'from app.database import engine, Base\n' : ''}
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan context for startup and shutdown routines."""
    # Startup actions
    print(f"🚀 Initializing {settings.PROJECT_NAME} in '{settings.ENVIRONMENT}' environment...")
    ${hasDb ? '# Create DB tables automatically on boot (for development / prototyping)\n    Base.metadata.create_all(bind=engine)\n    print("📦 Database tables verified.")' : 'pass'}
    
    yield
    
    # Shutdown actions
    print("🛑 Shutting down application gracefully...")
    ${hasDb ? 'engine.dispose()\n    print("🔌 Database connection pool closed.")' : 'pass'}


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="${title} built with FastAPI, Pydantic V2, and clean modular architecture.",
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    docs_url=f"{settings.API_V1_PREFIX}/docs",
    redoc_url=f"{settings.API_V1_PREFIX}/redoc",
    lifespan=lifespan,
)

${
  hasCors
    ? `# Enable Cross-Origin Resource Sharing (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
`
    : ''
}
# Health check probe
@app.get("/health", tags=["System"])
def health_check():
    """Liveness probe used by orchestration and load balancers."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "docs": f"{settings.API_V1_PREFIX}/docs"
    }


# Mount versioned API routes
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
`;
}

function generateConfigPy(config: ProjectConfig): string {
  const isPostgres = config.databaseType === 'postgresql';
  const defaultDbUrl = isPostgres
    ? 'postgresql+psycopg2://postgres:postgres@localhost:5432/fastapi_db'
    : 'sqlite:///./app_data.db';

  return `"""
Application Configuration Module
Pydantic V2 BaseSettings loaded from system environment and .env file
"""

from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "${config.projectName || 'FastAPI Service'}"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"

    # CORS Configuration
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    ${
      config.includeDatabase
        ? `# Database Connection String
    DATABASE_URL: str = "${defaultDbUrl}"
    DB_ECHO_SQL: bool = False
    `
        : ''
    }
    ${
      config.includeAuth
        ? `# Security & JWT Credentials
    SECRET_KEY: str = "CHANGE_THIS_TO_A_SECURE_RANDOM_SECRET_KEY_IN_PRODUCTION"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 Hours
    `
        : ''
    }
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
`;
}

function generateDatabasePy(config: ProjectConfig): string {
  const isSqlite = config.databaseType === 'sqlite';

  return `"""
Database Connection and Session Management
SQLAlchemy 2.0 Declarative Engine and Dependency
"""

from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase, Session
from app.config import settings

# Engine configuration
${
  isSqlite
    ? `engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False},  # Required for SQLite concurrency
    echo=settings.DB_ECHO_SQL,
)`
    : `engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    echo=settings.DB_ECHO_SQL,
)`
}

# Thread-local session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Base declarative class for all SQLAlchemy ORM models."""
    pass


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that provides a transactional database session per request.
    Automatically commits or rolls back and closes connection when done.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
`;
}

function generateModelsPy(config: ProjectConfig, entities: EntityDefinition[]): string {
  const hasAuth = config.includeAuth;

  let content = `"""
SQLAlchemy 2.0 ORM Models
"""

from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy import String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)
`;

  if (hasAuth) {
    content += `

class User(Base):
    """User account entity for authentication and record ownership."""
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    username: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)
`;
  }

  for (const entity of entities) {
    content += `

class ${entity.name}(Base):
    """${entity.name} domain record."""
    __tablename__ = "${entity.tableName}"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
`;

    for (const f of entity.fields) {
      const pyType = f.type === 'str' ? 'str' : f.type === 'int' ? 'int' : f.type === 'float' ? 'float' : f.type === 'bool' ? 'bool' : 'datetime';
      const colType = f.type === 'str' ? 'String(255)' : f.type === 'int' ? 'Integer' : f.type === 'float' ? 'Float' : f.type === 'bool' ? 'Boolean' : 'DateTime';
      const optWrap = f.nullable ? `Optional[${pyType}]` : pyType;
      const defaultArg = f.defaultValue ? `, default=${f.defaultValue}` : '';
      const uniqueArg = f.isUnique ? ', unique=True, index=True' : '';

      content += `    ${f.name}: Mapped[${optWrap}] = mapped_column(${colType}${uniqueArg}${defaultArg}, nullable=${f.nullable ? 'True' : 'False'})\n`;
    }

    if (hasAuth && entity.hasOwnerRelationship) {
      content += `    owner_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)\n`;
    }

    content += `    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)\n`;
    content += `    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, onupdate=utc_now)\n`;
  }

  return content;
}

function generateSchemasPy(config: ProjectConfig, entities: EntityDefinition[]): string {
  const hasAuth = config.includeAuth;

  let content = `"""
Pydantic V2 Schemas for Request Validation and Response Serialization
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, ConfigDict
`;

  if (hasAuth) {
    content += `

# -------------------------------------------------------------
# User & Auth Schemas
# -------------------------------------------------------------

class UserBase(BaseModel):
    email: EmailStr = Field(..., description="Unique email address")
    username: str = Field(..., min_length=3, max_length=50, description="Display username")


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, description="Plaintext password (min 8 chars)")


class UserResponse(UserBase):
    id: int
    is_active: bool
    is_superuser: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[int] = None
`;
  }

  for (const entity of entities) {
    content += `

# -------------------------------------------------------------
# ${entity.name} Schemas
# -------------------------------------------------------------

class ${entity.name}Base(BaseModel):
`;
    for (const f of entity.fields) {
      const typeStr = f.type === 'str' ? 'str' : f.type === 'int' ? 'int' : f.type === 'float' ? 'float' : f.type === 'bool' ? 'bool' : 'datetime';
      const optStr = f.nullable ? `Optional[${typeStr}] = None` : typeStr;
      content += `    ${f.name}: ${optStr} = Field(${f.nullable ? 'None' : '...'}, description="${f.description || f.name}")\n`;
    }

    content += `

class ${entity.name}Create(${entity.name}Base):
    pass


class ${entity.name}Update(BaseModel):
`;
    for (const f of entity.fields) {
      const typeStr = f.type === 'str' ? 'str' : f.type === 'int' ? 'int' : f.type === 'float' ? 'float' : f.type === 'bool' ? 'bool' : 'datetime';
      content += `    ${f.name}: Optional[${typeStr}] = None\n`;
    }

    content += `

class ${entity.name}Response(${entity.name}Base):
    id: int
    created_at: datetime
    updated_at: datetime
${hasAuth && entity.hasOwnerRelationship ? '    owner_id: Optional[int] = None\n' : ''}
    model_config = ConfigDict(from_attributes=True)


class ${entity.name}ListResponse(BaseModel):
    items: List[${entity.name}Response]
    total: int
    page: int
    page_size: int
`;
  }

  return content;
}

function generateAuthPy(config: ProjectConfig): string {
  const hasDb = config.includeDatabase;

  return `"""
Authentication & Authorization Security Utilities
JWT token creation, validation, password hashing, and OAuth2 security schemes
"""

from datetime import datetime, timedelta, timezone
from typing import Optional, Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.config import settings
from app.schemas import TokenData
${hasDb ? 'from sqlalchemy.orm import Session\nfrom app.database import get_db\nfrom app.models import User\n' : ''}
# Password hashing context (Bcrypt)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 token header bearer scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_PREFIX}/auth/login")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Validate plaintext password against stored hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Generate salted bcrypt password hash."""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Generate encoded JWT with claims and expiry."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    ${hasDb ? 'db: Annotated[Session, Depends(get_db)]' : ''}
)${hasDb ? ' -> User' : ' -> dict'}:
    """Dependency that inspects the Bearer token and returns the authenticated user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        user_id: int = payload.get("user_id")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username, user_id=user_id)
    except JWTError:
        raise credentials_exception

    ${
      hasDb
        ? `user = db.query(User).filter(User.username == token_data.username).first()
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user account")
    return user`
        : `return {"username": token_data.username, "user_id": token_data.user_id}`
    }
`;
}

function generateRoutesPy(config: ProjectConfig, entities: EntityDefinition[]): string {
  const hasDb = config.includeDatabase;
  const hasAuth = config.includeAuth;
  const primary = entities[0];

  let content = `"""
API Router Aggregation and Resource Endpoints
"""

from typing import List, Annotated, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
${hasDb ? 'from sqlalchemy.orm import Session\nfrom app.database import get_db\nfrom app.models import ' + (hasAuth ? 'User, ' : '') + entities.map((e) => e.name).join(', ') + '\n' : ''}
from app.schemas import (
${hasAuth ? '    UserCreate, UserResponse, Token,\n' : ''}    ${entities.map((e) => `${e.name}Create, ${e.name}Update, ${e.name}Response, ${e.name}ListResponse`).join(',\n    ')}
)
${
  hasAuth
    ? `from fastapi.security import OAuth2PasswordRequestForm
from app.auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user,
)
`
    : ''
}
api_router = APIRouter()
`;

  if (hasAuth) {
    content += `
# -------------------------------------------------------------
# Authentication Endpoints
# -------------------------------------------------------------
auth_router = APIRouter(prefix="/auth", tags=["Authentication"])


@auth_router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(
    user_in: UserCreate,
    ${hasDb ? 'db: Annotated[Session, Depends(get_db)]' : ''}
):
    """Register a new user account with hashed credentials."""
    ${
      hasDb
        ? `existing_user = db.query(User).filter(
        (User.email == user_in.email) | (User.username == user_in.username)
    ).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email is already registered",
        )

    user = User(
        email=user_in.email,
        username=user_in.username,
        hashed_password=get_password_hash(user_in.password),
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user`
        : `return {
        "id": 1,
        "email": user_in.email,
        "username": user_in.username,
        "is_active": True,
        "is_superuser": False,
        "created_at": "2026-09-25T12:00:00Z"
    }`
    }


@auth_router.post("/login", response_model=Token)
def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    ${hasDb ? 'db: Annotated[Session, Depends(get_db)]' : ''}
):
    """OAuth2 compatible token login, returns Bearer JWT."""
    ${
      hasDb
        ? `user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.username, "user_id": user.id})
    return {"access_token": access_token, "token_type": "bearer"}`
        : `if form_data.username != "admin" or form_data.password != "secret":
        raise HTTPException(status_code=401, detail="Invalid test credentials")
    return {"access_token": "mock-jwt-token-sample", "token_type": "bearer"}`
    }


@auth_router.get("/me", response_model=UserResponse)
def read_current_user_profile(
    current_user: Annotated[${hasDb ? 'User' : 'dict'}, Depends(get_current_user)]
):
    """Inspect profile details for the currently authenticated user."""
    return current_user


api_router.include_router(auth_router)
`;
  }

  // Endpoints for each entity
  for (const entity of entities) {
    const slug = entity.plural;
    content += `
# -------------------------------------------------------------
# ${entity.name} Resource Endpoints
# -------------------------------------------------------------
${entity.tableName}_router = APIRouter(prefix="/${slug}", tags=["${entity.name}s"])


@${entity.tableName}_router.get("", response_model=${entity.name}ListResponse)
def list_${entity.plural}(
    page: int = Query(1, ge=1, description="Page index"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    ${hasDb ? 'db: Annotated[Session, Depends(get_db)],\n' : ''}${hasAuth ? `    current_user: Annotated[${hasDb ? 'User' : 'dict'}, Depends(get_current_user)],\n` : ''}):
    """Retrieve a paginated collection of ${entity.name} items."""
    ${
      hasDb
        ? `query = db.query(${entity.name})
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return {"items": items, "total": total, "page": page, "page_size": page_size}`
        : `return {
        "items": [],
        "total": 0,
        "page": page,
        "page_size": page_size
    }`
    }


@${entity.tableName}_router.post("", response_model=${entity.name}Response, status_code=status.HTTP_201_CREATED)
def create_${entity.name.toLowerCase()}(
    payload: ${entity.name}Create,
    ${hasDb ? 'db: Annotated[Session, Depends(get_db)],\n' : ''}${hasAuth ? `    current_user: Annotated[${hasDb ? 'User' : 'dict'}, Depends(get_current_user)],\n` : ''}):
    """Create a new ${entity.name} record."""
    ${
      hasDb
        ? `db_obj = ${entity.name}(
        **payload.model_dump(),
        ${hasAuth && entity.hasOwnerRelationship ? 'owner_id=current_user.id' : ''}
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj`
        : `return {
        "id": 1,
        **payload.model_dump(),
        "created_at": "2026-09-25T12:00:00Z",
        "updated_at": "2026-09-25T12:00:00Z"
    }`
    }


@${entity.tableName}_router.get("/{id}", response_model=${entity.name}Response)
def get_${entity.name.toLowerCase()}(
    id: int,
    ${hasDb ? 'db: Annotated[Session, Depends(get_db)],\n' : ''}${hasAuth ? `    current_user: Annotated[${hasDb ? 'User' : 'dict'}, Depends(get_current_user)],\n` : ''}):
    """Fetch single ${entity.name} record by numeric identifier."""
    ${
      hasDb
        ? `item = db.query(${entity.name}).filter(${entity.name}.id == id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"${entity.name} with id {id} not found"
        )
    return item`
        : `raise HTTPException(status_code=404, detail="${entity.name} not found")`
    }


@${entity.tableName}_router.put("/{id}", response_model=${entity.name}Response)
def update_${entity.name.toLowerCase()}(
    id: int,
    payload: ${entity.name}Update,
    ${hasDb ? 'db: Annotated[Session, Depends(get_db)],\n' : ''}${hasAuth ? `    current_user: Annotated[${hasDb ? 'User' : 'dict'}, Depends(get_current_user)],\n` : ''}):
    """Update fields of an existing ${entity.name} record."""
    ${
      hasDb
        ? `item = db.query(${entity.name}).filter(${entity.name}.id == id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="${entity.name} not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return item`
        : `raise HTTPException(status_code=404, detail="${entity.name} not found")`
    }


@${entity.tableName}_router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_${entity.name.toLowerCase()}(
    id: int,
    ${hasDb ? 'db: Annotated[Session, Depends(get_db)],\n' : ''}${hasAuth ? `    current_user: Annotated[${hasDb ? 'User' : 'dict'}, Depends(get_current_user)],\n` : ''}):
    """Remove a ${entity.name} record permanently."""
    ${
      hasDb
        ? `item = db.query(${entity.name}).filter(${entity.name}.id == id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="${entity.name} not found")
    db.delete(item)
    db.commit()
    return None`
        : `return None`
    }


api_router.include_router(${entity.tableName}_router)
`;
  }

  return content;
}

function generateRequirementsTxt(config: ProjectConfig): string {
  const packages = [
    'fastapi>=0.111.0',
    'uvicorn[standard]>=0.30.0',
    'pydantic>=2.7.0',
    'pydantic-settings>=2.2.0',
  ];

  if (config.includeDatabase) {
    packages.push('sqlalchemy>=2.0.30');
    if (config.databaseType === 'postgresql') {
      packages.push('psycopg2-binary>=2.9.9');
    }
  }

  if (config.includeAuth) {
    packages.push('python-jose[cryptography]>=3.3.0');
    packages.push('passlib[bcrypt]>=1.7.4');
    packages.push('python-multipart>=0.0.9');
  }

  if (config.includePytest) {
    packages.push('pytest>=8.2.0');
    packages.push('httpx>=0.27.0');
    packages.push('pytest-asyncio>=0.23.0');
  }

  return packages.join('\n') + '\n';
}

function generateDockerfile(config: ProjectConfig): string {
  const pyVersion = config.pythonVersion || '3.11';
  return `# Multi-stage lean Dockerfile for production FastAPI deployment
FROM python:${pyVersion}-slim AS base

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \\
    curl \\
    && rm -rf /var/lib/apt/lists/*

# Set python environment flags
ENV PYTHONUNBUFFERED=1 \\
    PYTHONDONTWRITEBYTECODE=1 \\
    PIP_NO_CACHE_DIR=1 \\
    PORT=8000

WORKDIR /app

# Install python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy application source code
COPY . .

# Create non-root runner user for security compliance
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:8000/health || exit 1

# Production server command
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
`;
}

function generateDockerComposeYml(config: ProjectConfig, projectSlug: string): string {
  const isPostgres = config.databaseType === 'postgresql';

  if (isPostgres) {
    return `version: '3.8'

services:
  api:
    build: .
    container_name: ${projectSlug}_api
    restart: unless-stopped
    ports:
      - "8000:8000"
    environment:
      - ENVIRONMENT=development
      - DEBUG=True
      - DATABASE_URL=postgresql+psycopg2://postgres:postgres@db:5432/${projectSlug}_db
      - SECRET_KEY=development-secret-key-change-in-production
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - ./app:/app/app

  db:
    image: postgres:16-alpine
    container_name: ${projectSlug}_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: ${projectSlug}_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
`;
  }

  return `version: '3.8'

services:
  api:
    build: .
    container_name: ${projectSlug}_api
    restart: unless-stopped
    ports:
      - "8000:8000"
    environment:
      - ENVIRONMENT=development
      - DEBUG=True
    volumes:
      - ./app:/app/app
      - sqlite_data:/app/data

volumes:
  sqlite_data:
`;
}

function generateTestMainPy(config: ProjectConfig, entities: EntityDefinition[]): string {
  const hasAuth = config.includeAuth;
  const primary = entities[0];

  return `"""
Automated Integration Tests for FastAPI Application
Run with: pytest -v
"""

import pytest
from fastapi.testclient import TestClient


def test_health_check_endpoint(client: TestClient):
    """Ensure system health check returns 200 and healthy status."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "service" in data


def test_openapi_documentation(client: TestClient):
    """Verify OpenAPI JSON schema compiles properly."""
    response = client.get("/api/v1/openapi.json")
    assert response.status_code == 200
    assert "paths" in response.json()


${
  hasAuth
    ? `def test_register_and_login_flow(client: TestClient):
    """Verify new user registration and JWT authentication token issuance."""
    # 1. Register new user
    user_payload = {
        "email": "developer@fastapiscaffolder.dev",
        "username": "fastapidev",
        "password": "SuperSecretPassword123!"
    }
    reg_res = client.post("/api/v1/auth/register", json=user_payload)
    assert reg_res.status_code == 201
    assert reg_res.json()["username"] == "fastapidev"

    # 2. Login to obtain JWT
    login_res = client.post(
        "/api/v1/auth/login",
        data={"username": "fastapidev", "password": "SuperSecretPassword123!"}
    )
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"

    # 3. Access protected route
    headers = {"Authorization": f"Bearer {token_data['access_token']}"}
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "developer@fastapiscaffolder.dev"
`
    : ''
}

def test_list_${primary.plural}(client: TestClient${hasAuth ? ', auth_headers: dict' : ''}):
    """Ensure fetching collection of ${primary.name} returns paginated object."""
    response = client.get("/api/v1/${primary.plural}"${hasAuth ? ', headers=auth_headers' : ''})
    assert response.status_code == 200
    payload = response.json()
    assert "items" in payload
    assert isinstance(payload["items"], list)
    assert "total" in payload
`;
}

function generateConftestPy(config: ProjectConfig): string {
  const hasDb = config.includeDatabase;
  const hasAuth = config.includeAuth;

  return `"""
Pytest Fixtures and Test Environment Setup
"""

import pytest
from typing import Generator
from fastapi.testclient import TestClient
from app.main import app
${
  hasDb
    ? `from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base, get_db

# In-memory SQLite engine for hermetic test execution
TEST_DB_URL = "sqlite:///:memory:"
test_engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
`
    : ''
}

@pytest.fixture(scope="session")
def client() -> Generator[TestClient, None, None]:
    """TestClient instance configured with database override if enabled."""
    ${
      hasDb
        ? `Base.metadata.create_all(bind=test_engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=test_engine)`
        : `with TestClient(app) as c:
        yield c`
    }

${
  hasAuth
    ? `@pytest.fixture(scope="module")
def auth_headers(client: TestClient) -> dict:
    """Fixture providing authorized bearer token headers for protected endpoint tests."""
    user_payload = {
        "email": "testuser@example.com",
        "username": "testuser",
        "password": "Password123!"
    }
    client.post("/api/v1/auth/register", json=user_payload)
    login_res = client.post(
        "/api/v1/auth/login",
        data={"username": "testuser", "password": "Password123!"}
    )
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
`
    : ''
}
`;
}

function generateEnvExample(config: ProjectConfig, projectSlug: string): string {
  const isPostgres = config.databaseType === 'postgresql';
  return `# Environment Configuration Template
PROJECT_NAME="${config.projectName || 'FastAPI Service'}"
ENVIRONMENT=development
DEBUG=True

${
  config.includeDatabase
    ? isPostgres
      ? `DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/${projectSlug}_db\nDB_ECHO_SQL=False`
      : `DATABASE_URL=sqlite:///./app_data.db\nDB_ECHO_SQL=False`
    : ''
}

${
  config.includeAuth
    ? `SECRET_KEY=generate_a_random_32_byte_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
`
    : ''
}
CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]
`;
}

function generateReadmeMd(
  config: ProjectConfig,
  title: string,
  summary: string,
  entities: EntityDefinition[]
): string {
  return `# ${title}

${summary}

Generated with **FastAPI Scaffolder** — production-grade, typed, modern Python backend template.

---

## 🛠 Features Included

- **FastAPI**: Modern, high-performance web framework.
- **Pydantic V2**: Strict validation schemas and automated serialization.
${config.includeDatabase ? `- **SQLAlchemy 2.0 ORM**: ${config.databaseType === 'postgresql' ? 'PostgreSQL relational engine' : 'SQLite zero-config local storage'}.\n` : ''}${config.includeAuth ? '- **JWT Authentication**: Password hashing (Bcrypt), OAuth2 password flow, and protected route dependencies.\n' : ''}${config.includeDocker ? '- **Docker & Compose**: Multi-stage lightweight Dockerfile and orchestration.\n' : ''}${config.includePytest ? '- **Pytest Suite**: Complete unit and integration tests with TestClient.\n' : ''}
---

## 🚀 Quick Start (Local Setup)

### 1. Create Virtual Environment
\`\`\`bash
# Create virtual environment
python -m venv .venv

# Activate (Linux / macOS)
source .venv/bin/activate

# Activate (Windows)
# .venv\\Scripts\\activate
\`\`\`

### 2. Install Dependencies
\`\`\`bash
pip install --upgrade pip
pip install -r requirements.txt
\`\`\`

### 3. Configure Environment
\`\`\`bash
cp .env.example .env
\`\`\`

### 4. Run Development Server
\`\`\`bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
\`\`\`

Open your browser to:
- **Interactive Swagger UI**: [http://127.0.0.1:8000/api/v1/docs](http://127.0.0.1:8000/api/v1/docs)
- **Alternative ReDoc UI**: [http://127.0.0.1:8000/api/v1/redoc](http://127.0.0.1:8000/api/v1/redoc)
- **Health Check**: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

${
  config.includeDocker
    ? `---

## 🐳 Running with Docker

\`\`\`bash
# Build and boot containerized stack
docker compose up --build

# Run in detached background mode
docker compose up -d
\`\`\`
`
    : ''
}
${
  config.includePytest
    ? `---

## 🧪 Running Automated Tests

\`\`\`bash
pytest -v
\`\`\`
`
    : ''
}

---

## 📡 API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| \`GET\` | \`/health\` | Liveness probe and status |
${config.includeAuth ? '| `POST` | `/api/v1/auth/register` | Register new user account |\n| `POST` | `/api/v1/auth/login` | Obtain JWT bearer token |\n| `GET` | `/api/v1/auth/me` | Current authenticated user profile |\n' : ''}${entities.map((e) => `| \`GET\` | \`/api/v1/${e.plural}\` | List paginated ${e.plural} |\n| \`POST\` | \`/api/v1/${e.plural}\` | Create new ${e.name} |\n| \`GET\` | \`/api/v1/${e.plural}/{id}\` | Get ${e.name} by ID |\n| \`PUT\` | \`/api/v1/${e.plural}/{id}\` | Update ${e.name} record |\n| \`DELETE\` | \`/api/v1/${e.plural}/{id}\` | Delete ${e.name} record |`).join('\n')}
`;
}
