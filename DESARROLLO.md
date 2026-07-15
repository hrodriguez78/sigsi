# Guía de Desarrollo - SGI Platform

## Convenciones de Código

### Python (FastAPI/Django)

#### Estilo
- Seguir PEP 8
- Usar snake_case para variables y funciones
- Usar CamelCase para clases
- Docstrings para funciones públicas

#### Estructura FastAPI
```python
# app/api/v1/endpoints/users.py
from fastapi import APIRouter, Depends
from app.schemas.user import UserCreate, UserResponse
from app.services.user import UserService

router = APIRouter()

@router.post("/users", response_model=UserResponse)
async def create_user(user: UserCreate, service: UserService = Depends()):
    return await service.create(user)
```

#### Estructura Django
```python
# apps/users/models.py
from django.db import models
from apps.core.models import TimeStampedModel

class User(TimeStampedModel):
    email = models.EmailField(unique=True)
    
    class Meta:
        verbose_name = "Usuario"
```

### TypeScript (Angular)

#### Estilo
- Seguir Angular Style Guide
- Usar camelCase para variables y funciones
- Usar PascalCase para clases y componentes
- Interfaces con prefijo 'I' (opcional)

#### Estructura de Componente
```typescript
// features/users/user-list.component.ts
@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  
  constructor(private userService: UserService) {}
  
  ngOnInit(): void {
    this.loadUsers();
  }
  
  private loadUsers(): void {
    this.userService.getUsers().subscribe(
      users => this.users = users
    );
  }
}
```

## Git

### Convención de Commits
```
tipo(alcance): descripción

[opcional cuerpo]

[opcional footer]
```

### Tipos
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Documentación
- `style`: Formato (no afecta código)
- `refactor`: Refactorización
- `test`: Tests
- `chore`: Tareas de mantenimiento

### Ejemplos
```bash
git commit -m "feat(auth): implement JWT authentication"
git commit -m "fix(api): correct user creation validation"
git commit -m "docs(readme): update installation guide"
```

### Ramas
- `main`: Producción
- `develop`: Desarrollo
- `feature/*`: Nuevas funcionalidades
- `fix/*`: Correcciones
- `release/*`: Pre-producción

## Testing

### FastAPI
```python
# tests/test_users.py
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_create_user():
    response = client.post("/api/v1/users", json={
        "email": "test@example.com",
        "name": "Test User"
    })
    assert response.status_code == 201
    assert response.json()["email"] == "test@example.com"
```

### Django
```python
# apps/users/tests.py
from django.test import TestCase
from .models import User

class UserTestCase(TestCase):
    def test_create_user(self):
        user = User.objects.create(
            email="test@example.com",
            username="testuser"
        )
        self.assertEqual(user.email, "test@example.com")
```

### Angular
```typescript
// user-list.component.spec.ts
describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserListComponent],
      imports: [HttpClientModule]
    }).compileComponents();
    
    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
  });
  
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

## Docker

### Dockerfile Best Practices
```dockerfile
# Multi-stage build
FROM python:3.11-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.11-slim AS runtime
WORKDIR /app
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY . .
```

### Docker Compose
- Usar `depends_on` con healthchecks
- Configurar volúmenes para desarrollo
- Usar variables de entorno para configuración

## Seguridad

### Autenticación
- JWT tokens con expiración
- Refresh tokens para sesiones largas
- Rate limiting en endpoints sensibles

### Autorización
- RBAC para roles
- ABAC para permisos granulares
- Validación de permisos en cada endpoint

### Datos
- Encriptar datos sensibles
- Hash de contraseñas con bcrypt (passlib + bcrypt 4.0.1)
- Validación de entrada estricta

## Performance

### Backend
- Usar async/await en FastAPI
- Implementar caching con Redis
- Paginación en listados
- Indexación en bases de datos

### Frontend
- Lazy loading de módulos
- OnPush change detection
- Virtual scrolling para listas grandes
- Optimización de imágenes

## Documentación

### API
- OpenAPI/Swagger automático en FastAPI
- Docstrings en endpoints
- Ejemplos de request/response

### Código
- Comentarios solo cuando sea necesario
- README actualizado en cada repositorio
- CHANGELOG para cambios importantes