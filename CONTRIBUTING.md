# Contributing - SGI Platform

¡Gracias por tu interés en contribuir a SGI Platform!

## Guía para Contribuidores

### Pre-requisitos

- Docker 24+
- Docker Compose 2.20+
- Git
- Editor de código (VS Code recomendado)

### Pasos para Contribuir

#### 1. Fork el Repositorio
```bash
# En GitHub, hacer fork del repositorio
# Clonar tu fork
git clone https://github.com/tu-usuario/sgi-platform.git
cd sgi-platform
```

#### 2. Configurar Entorno de Desarrollo
```bash
# Copiar variables de entorno
cd sgi-infrastructure
cp .env.example .env

# Iniciar servicios
./scripts/start.sh
```

#### 3. Crear Rama de Desarrollo
```bash
# Crear rama para tu funcionalidad
git checkout -b feature/nombre-funcionalidad

# O para corrección
git checkout -b fix/nombre-correccion
```

#### 4. Desarrollar tu Funcionalidad

##### Convenciones de Código

**Python (FastAPI/Django)**:
- Seguir PEP 8
- Usar type hints
- Docstrings para funciones públicas
- Tests para código nuevo

**TypeScript (Angular)**:
- Seguir Angular Style Guide
- Usar interfaces para tipos
- Componentes con OnPush change detection
- Tests para componentes

**Git**:
- Commits descriptivos
- Seguir convención de commits (feat, fix, docs, etc.)
- Un commit por cambio lógico

#### 5. Tests
```bash
# Backend FastAPI
cd sgi-backend-fastapi
python -m pytest

# Django
cd sgi-django-admin
python manage.py test

# Frontend Angular
cd sgi-frontend-angular
npm test
```

#### 6. Documentación
- Actualizar README si es necesario
- Agregar documentación de API
- Actualizar CHANGELOG.md

#### 7. Crear Pull Request
```bash
# Push a tu fork
git push origin feature/nombre-funcionalidad
```

En GitHub:
1. Ir a "Pull requests"
2. Click "New pull request"
3. Seleccionar tu rama
4. Agregar descripción detallada
5. Referenciar issues relacionados

### Estructura de Pull Request

```markdown
## Descripción
[Descripción breve del cambio]

## Tipo de Cambio
- [ ] Nueva funcionalidad (feat)
- [ ] Corrección de bug (fix)
- [ ] Documentación (docs)
- [ ] Refactorización (refactor)
- [ ] Tests (test)
- [ ] Mantenimiento (chore)

## Cambios
- [Lista de cambios realizados]

## Testing
- [Descripción de tests realizados]
- [Resultados de tests]

## Screenshots (si aplica)
[Capturas de pantalla del cambio]

## Related Issues
- Fixes #123
- Closes #456
```

### Normas de Código

#### Python
```python
# Buena práctica
def create_user(user_data: UserCreate) -> User:
    """
    Crear un nuevo usuario.
    
    Args:
        user_data: Datos del usuario a crear
        
    Returns:
        User: Usuario creado
    """
    # Implementación
    pass
```

#### TypeScript
```typescript
// Buena práctica
@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
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

### Reglas Importantes

1. **No hacer commit de secretos**
   - No incluir contraseñas
   - No incluir API keys
   - No incluir tokens de acceso

2. **Tests obligatorios**
   - Todo código nuevo debe tener tests
   - Los tests deben pasar antes del merge

3. **Documentación**
   - Actualizar README si es necesario
   - Agregar docstrings a funciones públicas
   - Actualizar CHANGELOG

4. **Commits limpios**
   - Un commit por cambio lógico
   - Mensajes descriptivos
   - Seguir convención de commits

5. **Code review**
   - Todo PR requiere review
   - Resolver feedback antes del merge
   - Mantener conversación constructiva

### Issues y Bugs

#### Reportar un Bug
```markdown
## Descripción del Bug
[Descripción clara del problema]

## Pasos para Reproducir
1. Ir a '...'
2. Click en '...'
3. Ver error

## Comportamiento Esperado
[Qué se esperaba que pasara]

## Screenshots
[Si aplica]

## Entorno
- OS: [ej. Windows 10]
- Browser: [ej. Chrome 120]
- Versión: [ej. 1.0.0]
```

#### Solicitar Nueva Funcionalidad
```markdown
## Descripción
[Descripción de la funcionalidad solicitada]

## Caso de Uso
[Por qué se necesita]

## Solución Propuesta
[Cómo se podría implementar]

## Alternativas Consideradas
[Otras opciones evaluadas]
```

### Contacto

- **Issues**: Usar GitHub Issues
- **Discusiones**: GitHub Discussions
- **Email**: Para asuntos privados

## Agradecimientos

¡Gracias por contribuir a hacer mejor SGI Platform!