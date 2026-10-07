# Leaf Classifier App

Esta aplicación consiste en tres componentes principales: **backend**, **frontend** y **classifier**.

## Requisitos

- [Bun](https://bun.sh/) instalado
- [Python 3](https://www.python.org/) instalado
- [Postgres](https://www.postgresql.org/) instalado
- [Docker](https://www.docker.com/) instalado
- [Docker Compose](https://docs.docker.com/compose/) instalado

## Inicialización

Se debe descargar el modelo clasificador en la carpeta `classifier` bajo el nombre "vit_leaf_classifier.pth".

También se debe crear una base de datos con usuario y contraseña correspondientes a los colocados en el archivo `backend/.env`.

### Inicialización de Docker (desarrollo)

```bash
docker-compose -f docker-compose.yml  up -d
```

### Inicialización de Docker (producción)

```bash
docker-compose -f docker-compose.prod.yml  up -d
```

### 1. Backend

```bash
cd backend
bun install
bun prisma migrate dev
bun run dev
```

### 2. Frontend

```bash
cd frontend
bun install
bun run dev
```

### 3. Classifier (modelo de clasificación)

```bash
cd classifier
```

#### Instalar dependencias

crear un entorno virtual

```bash
python -m venv env
```

activar el entorno virtual

```bash
source env/bin/activate
```

```bash
pip install -r requirements.txt
```

#### Ejecutar el classifier

```bash
python3 app.py
```

## Desarrollo Rápido

Para iniciar todos los servicios de una vez, puedes usar el script de desarrollo:

```bash
./dev.sh
```

Este script iniciará automáticamente:

- **Classifier** en http://localhost:8000
- **Backend** en el puerto configurado en `src/server.ts`
- **Frontend** en el puerto configurado por Vite (por defecto 5173)

Presiona `Ctrl+C` para detener todos los servicios.

## Despliegue en Producción

### Requisitos para Despliegue

Antes de desplegar la aplicación en producción, asegúrate de tener:

1. **Docker y Docker Compose** instalados y funcionando
2. **Permisos sudo** para ejecutar comandos Docker
3. **Dominio configurado** apuntando a la IP del servidor
4. **Puertos 80 y 443** abiertos en el firewall
5. **Archivo `.env`** en la raíz del proyecto con las siguientes variables:
   - `DOMAIN`: El dominio donde se desplegará la aplicación (ej: `example.com`)
   - `EMAIL`: Email para notificaciones de Let's Encrypt (ej: `admin@example.com`)
6. **Archivo `backend/.env.prod`** con las variables de entorno del backend para producción:
   - `DATABASE_URL`: URL de conexión a la base de datos PostgreSQL
   - Otras variables de entorno necesarias para el backend

### Script de Despliegue (`deploy.sh`)

El script `deploy.sh` automatiza el proceso de despliegue completo:

```bash
./deploy.sh
```

**¿Qué hace el script?**

1. Verifica que exista el archivo `.env` con `DOMAIN` y `EMAIL` configurados
2. Crea los directorios necesarios para certificados SSL (`certbot/conf` y `certbot/www`)
3. Construye e inicia todos los servicios usando `docker-compose.prod.yml`
4. Espera a que el frontend esté listo
5. Verifica si ya existe un certificado SSL:
   - Si existe: omite la generación de certificados
   - Si no existe: solicita un certificado SSL de Let's Encrypt automáticamente
6. Recarga nginx para habilitar SSL

**Servicios desplegados:**

- **Base de datos PostgreSQL** (puerto interno)
- **Backend API** (puerto interno 5000)
- **Classifier Service** (puerto interno)
- **Frontend con Nginx** (puertos 80 y 443 expuestos)
- **Certbot** para gestión automática de certificados SSL

**Después del despliegue:**

- Frontend disponible en: `https://$DOMAIN`
- API disponible en: `https://$DOMAIN/api/v1`

**Comandos útiles después del despliegue:**

```bash
# Ver logs de todos los servicios
sudo docker compose -f docker-compose.prod.yml logs -f

# Ver logs de un servicio específico
sudo docker compose -f docker-compose.prod.yml logs -f backend
sudo docker compose -f docker-compose.prod.yml logs -f frontend
sudo docker compose -f docker-compose.prod.yml logs -f certbot

# Verificar estado de los servicios
sudo docker compose -f docker-compose.prod.yml ps

# Reiniciar un servicio específico
sudo docker compose -f docker-compose.prod.yml restart backend
```

### Script de Reset (`reset.sh`)

El script `reset.sh` permite resetear completamente el despliegue:

```bash
./reset.sh
```

**¿Qué hace el script?**

1. Detiene y elimina todos los contenedores
2. Pregunta si deseas eliminar volúmenes (esto **eliminará los datos de la base de datos**)
3. Pregunta si deseas eliminar las imágenes construidas
4. Pregunta si deseas eliminar los certificados SSL

**⚠️ Advertencia:** Este script puede eliminar datos importantes. Úsalo con precaución.

**Opciones interactivas:**

- **Eliminar volúmenes**: Si respondes `y`, se eliminarán todos los volúmenes, incluyendo los datos de PostgreSQL
- **Eliminar imágenes**: Si respondes `y`, se eliminarán las imágenes Docker construidas
- **Eliminar certificados SSL**: Si respondes `y`, se eliminarán los certificados SSL (tendrás que regenerarlos en el próximo despliegue)

**Después del reset:**

Para volver a desplegar después de un reset:

```bash
./deploy.sh
```

### Actualización de la Aplicación

Para actualizar la aplicación después de hacer cambios:

```bash
# 1. Detener los servicios
sudo docker compose -f docker-compose.prod.yml down

# 2. Reconstruir e iniciar con los nuevos cambios
./deploy.sh
```

O simplemente:

```bash
# Reconstruir e iniciar (el script ya hace build)
sudo docker compose -f docker-compose.prod.yml up -d --build
```

### Renovación de Certificados SSL

Los certificados SSL se renuevan automáticamente mediante el servicio `certbot` que corre en segundo plano. El servicio verifica la renovación cada 12 horas.

Para verificar manualmente el estado de los certificados:

```bash
sudo docker compose -f docker-compose.prod.yml logs certbot
```

### Solución de Problemas

**Problema: El certificado SSL no se genera**

1. Verifica que el dominio apunte correctamente a la IP del servidor
2. Verifica que los puertos 80 y 443 estén abiertos
3. Revisa los logs: `sudo docker compose -f docker-compose.prod.yml logs certbot_init`
4. Si el certificado falla, elimínalo y vuelve a intentar:
   ```bash
   sudo rm -rf certbot/conf/live/$DOMAIN
   ./deploy.sh
   ```

**Problema: Los servicios no inician**

1. Verifica los logs: `sudo docker compose -f docker-compose.prod.yml logs`
2. Verifica que el archivo `.env` y `backend/.env.prod` estén correctamente configurados
3. Verifica que la base de datos esté accesible

**Problema: El frontend no carga**

1. Verifica que nginx esté corriendo: `sudo docker compose -f docker-compose.prod.yml ps frontend`
2. Revisa los logs de nginx: `sudo docker compose -f docker-compose.prod.yml logs frontend`
3. Verifica la configuración de nginx en el contenedor

## Notas

- El backend corre en el puerto configurado en `src/server.ts`.
- El frontend corre en el puerto configurado por Vite (por defecto 5173).
- El classifier corre en el puerto 8000.
- En producción, el frontend se sirve a través de Nginx en los puertos 80 (HTTP) y 443 (HTTPS).
- Los certificados SSL se renuevan automáticamente cada 12 horas.
